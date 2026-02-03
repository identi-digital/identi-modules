from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, func, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model
@dataclass
class FarmerModel(Model):
  """ FarmerModel """

  __tablename__ = "farmers"
  __table_args__ = {"schema": "public", "extend_existing": True}
  
  id = Column(UUID(as_uuid=True),
                 primary_key=True,
                 server_default=text('uuid_generate_v4()'),
                 unique=True,
                 nullable=False)
  code: str = Column(String(50), info={"display_name": "Código", "description": "codigo del productor"})
  first_name: str = Column(String(50), info={"display_name": "Nombre", "description": "nombre del productor"})
  last_name: str = Column(String(50), info={"display_name": "Apellido", "description": "apellido del productor"})
  dni: str = Column(String(20), unique=True, info={"display_name": "DNI", "description": "dni del productor"})
  wsp_number = Column(String(25), info={"display_name": "Número de WhatsApp", "description": "numero de whatsapp del productor"})
  sms_number = Column(String(25), info={"display_name": "Número de SMS", "description": "numero de sms del productor"})
  call_number = Column(String(25), info={"display_name": "Número de Teléfono", "description": "numero de telefono del productor"})
  email = Column(Text, info={"display_name": "Email", "description": "email del productor"})
  address: str = Column(Text, info={"display_name": "Dirección", "description": "direccion del productor"})
  country_id: str = Column(String(12), ForeignKey('public.countries.id'), info={"display_name": "País", "description": "pais del productor"})
  department_id: str = Column(String(12), ForeignKey('public.departments.id'), info={"display_name": "Departamento", "description": "departamento del productor"})
  province_id: str = Column(String(12), ForeignKey('public.provinces.id'), info={"display_name": "Provincia", "description": "provincia del productor"})
  district_id: str = Column(String(12), ForeignKey('public.districts.id'), info={"display_name": "Distrito", "description": "distrito del productor"})
  created_at = Column(TIMESTAMP, server_default=func.now())
  updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
  disabled_at = Column(TIMESTAMP, nullable=True, default=None)
  
  def __init__(self, **kwargs):
    super(FarmerModel, self).__init__(**kwargs)

  def __hash__(self):
    return hash(self.id)

  