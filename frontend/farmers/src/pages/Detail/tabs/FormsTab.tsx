import { Box, Grid, Link, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CaptionStyled, FieldValueStyled, TitleSectionStyled } from '..';
import Paper from '@/ui/components/atoms/Paper/Paper';
import { FarmerForms } from '../../../models/farmer_forms';
import { EntityDetail } from '@/modules/forms/src/models/entities';
import { FarmerService } from '../../../services/farmer';
import { MediaViewerProps } from '@/models/media';
import MediaViewer from '@/ui/components/molecules/MediaComponent/MediaViewer';
import DateCell from '@/ui/components/atoms/DateCell/DateCell';
import { ScheduleRounded } from '@mui/icons-material';

type FormsTabProps = {
  farmer: any;
  farmerId: string;
};

const FormsTab: React.FC<FormsTabProps> = ({ farmerId }) => {
  const [forms, setForms] = useState<FarmerForms[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [mediaToShow, setMediaToShow] = useState<MediaViewerProps | null>(null);
  const [isOpenViewer, setIsOpenViewer] = useState<boolean>(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const handleCloseViewer = useCallback((value: boolean) => {
    setIsOpenViewer(value);
  }, []);

  const loadForms = useCallback(async () => {
    if (loading || !hasMore) return;
    if (total && forms.length >= total) return;

    setLoading(true);

    try {
      const res = await FarmerService.getFarmersMentionsRegisters(
        farmerId,
        page,
        perPage,
        'created_at',
        'desc',
        '',
      );

      if (res.items.length === 0) {
        setHasMore(false);
        return;
      }

      setForms((prev) => {
        const map = new Map(prev.map((f: FarmerForms) => [f.id, f]));
        res.items.forEach((f: FarmerForms) => map.set(f.id, f));
        return Array.from(map.values());
      });

      setTotal(res.total);
      setPage((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [farmerId, page, perPage, loading, hasMore, total, forms.length]);

  // Reset cuando cambia el farmer
  useEffect(() => {
    setForms([]);
    setPage(1);
    setTotal(0);
    setHasMore(true);
  }, [farmerId]);

  // Observer
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          loadForms();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0,
      },
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [loadForms, loading, hasMore]);

  return (
    <>
      {!loading && forms.length === 0 && (
        <Typography sx={{ textAlign: 'center', pt: 3 }}>
          No hay formularios para mostrar
        </Typography>
      )}

      {forms.map((form) => (
        <Paper key={form.id} sx={{ mt: 1 }}>
          <Box display={'flex'} justifyContent={'space-between'}>
            <TitleSectionStyled>{form.form.name ?? ''}</TitleSectionStyled>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                fontSize: '14px',
              }}
            >
              <ScheduleRounded />
              &nbsp;
              <DateCell
                date={new Date(form.created_at ?? '').toISOString()}
                inline={true}
              />
            </Box>
          </Box>

          <Grid container spacing={2}>
            {form.detail.map((element: EntityDetail) => (
              <Grid size={{ xs: 12, md: 4 }} key={element.name}>
                <CaptionStyled>{element.display_name ?? ''}</CaptionStyled>

                {element.type_value === 'media' ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{ cursor: 'pointer' }}
                  >
                    <Link
                      onClick={() => {
                        setMediaToShow({
                          value: element.value,
                          type_media: element?.type_media ?? '',
                        });
                        setIsOpenViewer(true);
                      }}
                    >
                      Ver
                    </Link>
                  </Box>
                ) : element.type_value === 'entity' ? (
                  <FieldValueStyled>
                    {Array.isArray(element?.value)
                      ? element.value.map((v: any) => v.display_name).join(', ')
                      : String(element?.value?.display_name ?? '-')}
                  </FieldValueStyled>
                ) : (
                  <FieldValueStyled>
                    {String(element.value ?? '-')}
                  </FieldValueStyled>
                )}
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}

      {loading && (
        <Typography sx={{ textAlign: 'center', py: 2 }}>
          Cargando formularios...
        </Typography>
      )}

      {/* SENTINEL DEL INFINITE SCROLL */}
      <div ref={observerRef} style={{ height: 1 }} />

      {isOpenViewer && (
        <MediaViewer
          element={mediaToShow}
          open={isOpenViewer}
          handleClose={handleCloseViewer}
        />
      )}
    </>
  );
};

export default React.memo(FormsTab);
