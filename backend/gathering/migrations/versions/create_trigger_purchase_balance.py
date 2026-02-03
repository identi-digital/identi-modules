"""create trigger purchase balance movement

Revision ID: g1h2i3j4k5l6
Revises: 
Create Date: 2026-01-26 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'g1h2i3j4k5l6'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Crea un trigger que se ejecuta después de cada INSERT en purchases.
    El trigger crea automáticamente un registro en balance_movements de tipo PURCHASE.
    """
    
    # Crear función PL/pgSQL que inserta en balance_movements
    op.execute("""
        CREATE OR REPLACE FUNCTION create_balance_movement_from_purchase()
        RETURNS TRIGGER AS $$
        DECLARE
            total_amount NUMERIC(15, 2);
        BEGIN
            -- Validar que gathering_center_id e identity_id no sean NULL
            -- Son requeridos para balance_movements
            IF NEW.gathering_center_id IS NULL THEN
                RAISE EXCEPTION 'gathering_center_id es requerido para crear balance_movement';
            END IF;
            
            IF NEW.identity_id IS NULL THEN
                RAISE EXCEPTION 'identity_id es requerido para crear balance_movement';
            END IF;
            
            -- Calcular el monto total de la compra (quantity * price)
            total_amount := NEW.quantity * NEW.price;
            
            -- Insertar el balance_movement automáticamente
            INSERT INTO balance_movements (
                gathering_center_id,
                gatherer_id,
                type_movement,
                purchase_id,
                ammount,
                identity_id,
                created_at,
                disabled_at
            ) VALUES (
                NEW.gathering_center_id,
                NEW.gatherer_id,
                'purchase',  -- tipo PURCHASE
                NEW.id,
                total_amount,
                NEW.identity_id,
                NOW(),
                NULL
            );
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    # Crear trigger AFTER INSERT en purchases
    op.execute("""
        DROP TRIGGER IF EXISTS trigger_create_balance_from_purchase ON purchases;
        
        CREATE TRIGGER trigger_create_balance_from_purchase
        AFTER INSERT ON purchases
        FOR EACH ROW
        EXECUTE FUNCTION create_balance_movement_from_purchase();
    """)


def downgrade() -> None:
    """
    Elimina el trigger y la función PL/pgSQL.
    """
    # Eliminar el trigger
    op.execute("DROP TRIGGER IF EXISTS trigger_create_balance_from_purchase ON purchases;")
    
    # Eliminar la función
    op.execute("DROP FUNCTION IF EXISTS create_balance_movement_from_purchase();")
