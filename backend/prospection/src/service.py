"""
Servicio del módulo prospection: integración KYC, métricas de core_registers y geojson por form_id.
"""
import os
import requests
from typing import Any, Dict, List
from sqlalchemy.orm import Session
from uuid import UUID
from sqlalchemy import text
from modules.farmers.src.models.farmers import FarmerModel

KYC_BASE_URL = os.getenv("KYC_BASE_URL")
ApiKeyKYC = os.getenv("ApiKeyKYC")
KYC_RESULTS_PATH = "/kyc_results"


class ProspectionServiceError(Exception):
    def __init__(self, message: str, status_code: int | None = None):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class ProspectionService:
    def __init__(self, container, database_key: str = "core_db"):
        self.container = container
        self.database_key = database_key

    def get_db(self) -> Session:
        return self.container.get(self.database_key, "databases")

    # --- API 1: KYC ---
    def get_kyc_results(self) -> dict | list:
        """Llama al servicio KYC y devuelve la respuesta JSON."""
    
        if not ApiKeyKYC:
            raise ProspectionServiceError("Variable de entorno ApiKeyKYC no configurada")
        url = f"{KYC_BASE_URL.rstrip('/')}{KYC_RESULTS_PATH}"
        r = requests.get(
            url,
            headers={
                "accept": "application/json",
                "ApiKey": ApiKeyKYC,
            },
            timeout=30,
        )
        if r.status_code >= 400:
            raise ProspectionServiceError(
                r.text or f"Error {r.status_code}",
                status_code=r.status_code,
            )
        # pagino los farmers 
        query_farmers = self.get_db().query(FarmerModel).filter(FarmerModel.disabled_at.is_(None))
        farmers = query_farmers.all()
        
        # recorro farmers_dict y si se encuentra dentro de kyc_rsults envio ese dato
        kyc_results = r.json()
        response = []
        for farmer in farmers:
            farmer_kyc = next((k for k in kyc_results if k.get("dni") == farmer.dni), None)
            if farmer_kyc:
                response.append(farmer_kyc)
            
        return response

    # --- API 2: Metrics ---
    def get_metrics(self) -> dict:
        """Métricas desde core_registers: counts por formid y porcentajes."""
        db = self.get_db()
        # formid 1 -> prospection_count
        r1 = db.execute(text("SELECT COUNT(*) AS c FROM core_registers WHERE form_id = '4dfb8bb2-4bab-4462-9f5a-3fdba3e624a6'"))
        prospection_count = r1.scalar() or 0
        # formid 2 -> visit_field_count
        r2 = db.execute(text("SELECT COUNT(*) AS c FROM core_registers WHERE form_id = 'f0b565fd-ac9a-45c0-b263-e1ee57376d6e'"))
        visit_field_count = r2.scalar() or 0
        # formid 3 -> suivis_count
        r3 = db.execute(text("SELECT COUNT(*) AS c FROM core_registers WHERE form_id = '7dc4cc1d-4c5c-44c1-a316-84734cb7a65b'"))
        suivis_count = r3.scalar() or 0

        visit_pct = int(visit_field_count / prospection_count * 100) if prospection_count else 0
        suivis_pct = int(suivis_count / prospection_count * 100) if prospection_count else 0

        return {
            "prospection_count": prospection_count,
            "visit_field_count": visit_field_count,
            "suivis_count": suivis_count,
            "visit_pct": visit_pct,
            "suivis_pct": suivis_pct,
        }

    # --- API 3: GeoJSON por form_id ---
    def get_geojson_by_form_id(self, form_id: UUID) -> list[list[Dict]]:
        """
        Para cada registro en core_registers con formid = form_id, recorre detail.
        Donde detail tenga un atributo con type_value == 'geojson', usa el 'name' de ese
        atributo como clave y agrega el valor (geojson) a la lista correspondiente.
        Devuelve un objeto { "nombre_campo": [geojson, ...], ... }.
        """
        db = self.get_db()
        rows = db.execute(
            text("SELECT detail FROM core_registers WHERE form_id = :fid"),
            {"fid": form_id},
        ).fetchall()

        result: list[list[Dict]] = []

        for (detail,) in rows:
            if not detail:
                continue
            # detail: dict clave=nombre attr, valor={ type_value, value } o lista de { name, type_value, value }
            if isinstance(detail, list):
                result.append(detail)
        return result
