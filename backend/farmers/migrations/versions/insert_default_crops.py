"""insert default crops and create trigger for farm_crops

Revision ID: f1a2b3c4d5e6
Revises: 
Create Date: 2026-01-28 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f1a2b3c4d5e6'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    1. Inserta los cultivos por defecto: Cacao y Café
    2. Crea un trigger para marcar automáticamente is_principal en el primer cultivo de cada parcela
    """
    # Insertar cultivos por defecto
    op.execute("""
        INSERT INTO public.crops(id, "name", crop_type, created_at, updated_at)
        VALUES('1', 'Cacao', 'Cacao', now(), now())
        ON CONFLICT (id) DO NOTHING;
    """)
    
    op.execute("""
        INSERT INTO public.crops(id, "name", crop_type, created_at, updated_at)
        VALUES('2', 'Café', 'Café', now(), now())
        ON CONFLICT (id) DO NOTHING;
    """)
    
    # Crear función PL/pgSQL para marcar el primer cultivo como principal
    op.execute("""
        CREATE OR REPLACE FUNCTION set_first_crop_as_principal()
        RETURNS TRIGGER AS $$
        DECLARE
            existing_crops_count INTEGER;
        BEGIN
            -- Contar cuántos cultivos activos ya existen para este farm_id
            SELECT COUNT(*) INTO existing_crops_count
            FROM public.farm_crops
            WHERE farm_id = NEW.farm_id
              AND disabled_at IS NULL;
            
            -- Si es el primer cultivo de la parcela, marcarlo como principal
            IF existing_crops_count = 0 THEN
                NEW.is_principal := TRUE;
            END IF;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    # Crear trigger BEFORE INSERT en farm_crops
    op.execute("""
        DROP TRIGGER IF EXISTS trigger_set_first_crop_as_principal ON public.farm_crops;
        
        CREATE TRIGGER trigger_set_first_crop_as_principal
        BEFORE INSERT ON public.farm_crops
        FOR EACH ROW
        EXECUTE FUNCTION set_first_crop_as_principal();
    """)


def downgrade() -> None:
    """
    1. Elimina el trigger y la función
    2. Elimina los cultivos por defecto
    """
    # Eliminar el trigger
    op.execute("DROP TRIGGER IF EXISTS trigger_set_first_crop_as_principal ON public.farm_crops;")
    
    # Eliminar la función
    op.execute("DROP FUNCTION IF EXISTS set_first_crop_as_principal();")
    
    # Eliminar cultivos por defecto
    op.execute("DELETE FROM public.crops WHERE id IN ('1', '2');")
