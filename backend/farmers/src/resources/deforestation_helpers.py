"""Helper functions for deforestation management"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session

def save_or_update_deforestation_request(
    farm_id: UUID,
    gfw_response: dict,
    db: Session,
    DeforestationRequestModel,
    DeforestationRequestStatusEnum
):
    """
    Guarda o actualiza un registro de deforestation_request basado en la respuesta de GFW.
    Solo debe haber un registro por farm_id.
    
    Args:
        farm_id: ID de la farm
        gfw_response: Respuesta de GFW con listId, status, data, etc.
        db: Sesión de base de datos
        DeforestationRequestModel: Modelo de SQLAlchemy
        DeforestationRequestStatusEnum: Enum de estados
    """
    try:
        # Buscar si ya existe un registro para este farm_id
        existing_request = db.query(DeforestationRequestModel).filter(
            DeforestationRequestModel.farm_id == farm_id,
            DeforestationRequestModel.disabled_at.is_(None)
        ).first()
        
        # Extraer datos de la respuesta de GFW
        request_id = gfw_response.get("listId")
        status_str = gfw_response.get("status", "pending")
        data_source = gfw_response.get("data", {})
        
        # Mapear status de GFW a nuestro enum
        status_mapping = {
            "pending": DeforestationRequestStatusEnum.PENDING,
            "completed": DeforestationRequestStatusEnum.COMPLETED,
            "rejected": DeforestationRequestStatusEnum.REJECTED,
            "failed": DeforestationRequestStatusEnum.REJECTED
        }
        status_enum = status_mapping.get(status_str.lower(), DeforestationRequestStatusEnum.PENDING)
        
        # Extraer métricas de deforestación si están disponibles en data
        natural_forest_loss_ha = None
        natural_forest_coverage_ha = None
        
        if isinstance(data_source, dict):
            natural_forest_loss_ha = data_source.get("natural_forest_loss_ha")
            natural_forest_coverage_ha = data_source.get("natural_forest_coverage_ha")
        
        if existing_request:
            # Actualizar registro existente
            existing_request.request_id = request_id
            existing_request.status = status_enum
            existing_request.natural_forest_loss_ha = natural_forest_loss_ha
            existing_request.natural_forest_coverage_ha = natural_forest_coverage_ha
            existing_request.data_source = data_source
            existing_request.updated_at = datetime.utcnow()
            
            print(f"🔄 Actualizando deforestation_request existente para farm_id: {farm_id}")
        else:
            # Crear nuevo registro
            new_request = DeforestationRequestModel(
                farm_id=farm_id,
                request_id=request_id,
                status=status_enum,
                natural_forest_loss_ha=natural_forest_loss_ha,
                natural_forest_coverage_ha=natural_forest_coverage_ha,
                data_source=data_source
            )
            db.add(new_request)
            print(f"➕ Creando nuevo deforestation_request para farm_id: {farm_id}")
        
        db.commit()
        print(f"✅ Deforestation request guardado exitosamente")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error al guardar deforestation_request: {e}")
        import traceback
        traceback.print_exc()
        # No lanzar excepción para no interrumpir el flujo principal


def check_and_update_deforestation_status(
    farm,  # FarmModel
    db: Session,
    token: Optional[str],
    DeforestationRequestModel,
    DeforestationRequestStatusEnum,
    geometry_to_geojson_func,
    save_or_update_func
) -> Optional[dict]:
    """
    Verifica y actualiza el estado de deforestación de una farm.
    
    Lógica:
    1. Busca registro en deforestation_requests
    2. Si no existe Y hay geometría: envía a GFW
    3. Si existe y está PENDING: consulta estado en GFW y actualiza
    4. Retorna dict con status, natural_forest_loss_ha, natural_forest_coverage_ha
    
    Args:
        farm: FarmModel object
        db: Database session
        token: Authorization token for GFW API
        DeforestationRequestModel: Modelo de SQLAlchemy
        DeforestationRequestStatusEnum: Enum de estados
        geometry_to_geojson_func: Función para convertir geometría a GeoJSON
        save_or_update_func: Función para guardar/actualizar request
        
    Returns:
        Dict con información de deforestación o None
    """
    try:
        # Buscar registro de deforestación existente
        deforestation_record = db.query(DeforestationRequestModel).filter(
            DeforestationRequestModel.farm_id == farm.id,
            DeforestationRequestModel.disabled_at.is_(None)
        ).first()
        
        # Caso 1: No hay registro y hay geometría -> Enviar a GFW
        if not deforestation_record and farm.geometry:
            try:
                print(f"🌳 No hay registro de deforestación para farm {farm.id}, enviando a GFW...")
                
                from ..environment import GFW_API_URL
                from ..services.gfw import GeoJSONTransformer
                
                # Convertir geometría a GeoJSON
                geometry_geojson = geometry_to_geojson_func(farm.geometry, db)
                
                if geometry_geojson and token:
                    gfw_service = GeoJSONTransformer()
                    gfw_response = gfw_service.send_gfw(
                        polygon=geometry_geojson,
                        api_url=GFW_API_URL,
                        token=token
                    )
                    
                    if gfw_response:
                        # Guardar nuevo registro
                        save_or_update_func(
                            farm_id=farm.id,
                            gfw_response=gfw_response,
                            db=db,
                            DeforestationRequestModel=DeforestationRequestModel,
                            DeforestationRequestStatusEnum=DeforestationRequestStatusEnum
                        )
                        
                        # Retornar información básica (PENDING)
                        return {
                            "status": "pending",
                            "natural_forest_loss_ha": None,
                            "natural_forest_coverage_ha": None
                        }
            except Exception as e:
                print(f"⚠️  Error al enviar a GFW: {e}")
                return None
        
        # Caso 2: Existe registro con status PENDING -> Consultar GFW
        elif deforestation_record and deforestation_record.status == DeforestationRequestStatusEnum.PENDING:
            try:
                print(f"🔄 Estado PENDING detectado, consultando GFW para actualizar...")
                
                from ..environment import GFW_API_URL
                from ..services.gfw import GeoJSONTransformer
                
                if token:
                    gfw_service = GeoJSONTransformer()
                    validation_response = gfw_service.request_validation(
                        request_id=deforestation_record.request_id,
                        api_url=GFW_API_URL,
                        token=token
                    )
                    
                    if validation_response:
                        # Actualizar registro con nueva información
                        status_str = validation_response.get("status", "pending")
                        data_dict = validation_response.get("data", {})
                        
                        # Mapear status
                        status_mapping = {
                            "pending": DeforestationRequestStatusEnum.PENDING,
                            "completed": DeforestationRequestStatusEnum.COMPLETED,
                            "rejected": DeforestationRequestStatusEnum.REJECTED,
                            "failed": DeforestationRequestStatusEnum.REJECTED
                        }
                        status_enum = status_mapping.get(status_str.lower(), DeforestationRequestStatusEnum.PENDING)
                        
                        # Extraer métricas
                        kpis = data_dict.get("deforestation_kpis", [])
                        if len(kpis) > 0:
                            kpi = kpis[-1]
                        else:
                            kpi = {}


                        natural_forest_loss_ha = kpi.get("Natural Forest Loss (ha) (Beta)")
                        natural_forest_coverage_ha = kpi.get("Natural Forest Coverage (HA) (Beta)")
                        
                        # Actualizar registro
                        deforestation_record.status = status_enum
                        deforestation_record.natural_forest_loss_ha = natural_forest_loss_ha
                        deforestation_record.natural_forest_coverage_ha = natural_forest_coverage_ha
                        deforestation_record.data_source = data_dict
                        deforestation_record.updated_at = datetime.utcnow()
                        
                        db.commit()
                        db.refresh(deforestation_record)
                        
                        print(f"✅ Registro de deforestación actualizado: {status_enum.value}")
            except Exception as e:
                print(f"⚠️  Error al consultar GFW: {e}")
        
        # Caso 3: Retornar información existente
        if deforestation_record:
            return {
                "status": deforestation_record.status.value if hasattr(deforestation_record.status, 'value') else str(deforestation_record.status),
                "natural_forest_loss_ha": float(deforestation_record.natural_forest_loss_ha) if deforestation_record.natural_forest_loss_ha else None,
                "natural_forest_coverage_ha": float(deforestation_record.natural_forest_coverage_ha) if deforestation_record.natural_forest_coverage_ha else None
            }
        
        return None
        
    except Exception as e:
        print(f"❌ Error en check_and_update_deforestation_status: {e}")
        import traceback
        traceback.print_exc()
        return None
