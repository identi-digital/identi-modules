"""insert initial certifications

Revision ID: m7n8o9p0q1r2
Revises: g1h2i3j4k5l6
Create Date: 2026-01-29 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'm7n8o9p0q1r2'
down_revision = 'g1h2i3j4k5l6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Inserta las certificaciones iniciales en la tabla certifications.
    """
    
    # Insertar certificaciones iniciales
    op.execute("""
        INSERT INTO public.certifications (id, "name", code)
        VALUES
            (uuid_generate_v4(), 'NOP', 'nop'),
            (uuid_generate_v4(), 'FLO', 'flo'),
            (uuid_generate_v4(), 'EU', 'eu'),
            (uuid_generate_v4(), 'RA', 'ra'),
            (uuid_generate_v4(), 'RTPO', 'rtpo'),
            (uuid_generate_v4(), 'BS', 'bs')
        ON CONFLICT (code) DO NOTHING;
    """)


def downgrade() -> None:
    """
    Elimina las certificaciones insertadas.
    """
    # Eliminar las certificaciones por código
    op.execute("""
        DELETE FROM public.certifications 
        WHERE code IN ('nop', 'flo', 'eu', 'ra', 'rtpo', 'bs');
    """)
