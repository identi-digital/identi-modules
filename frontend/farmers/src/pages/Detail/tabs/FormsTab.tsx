import { Box, Grid, Link, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CaptionStyled, FieldValueStyled, TitleSectionStyled } from '..';
import Paper from '@/ui/components/atoms/Paper/Paper';
import { FarmerForms } from '../../../models/farmer_forms';
import { EntityDetail } from '@/modules/forms/src/models/entities';
import { FarmerService } from '../../../services/farmer';
import { MediaViewerProps } from '@/models/media';
import MediaViewer from '@/ui/components/molecules/MediaComponent/MediaViewer';

type FormsTabProps = {
  farmer: any;
  farmerId: string;
};

const FormsTab: React.FC<FormsTabProps> = (props: FormsTabProps) => {
  const { farmerId } = props;

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
    if (loading) return;
    if (total && forms.length >= total) return;

    setLoading(true);
    const res = await FarmerService.getFarmersMentionsRegisters(
      farmerId,
      page,
      perPage,
      'created_at',
      '',
      '',
    );
    if (res.items.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    setForms((prev) => {
      const map = new Map(prev.map((f: FarmerForms) => [f.id, f]));
      res.items.forEach((f: FarmerForms) => map.set(f.id, f));
      return Array.from(map.values());
    });

    setTotal(res.total);
    setPage((prev) => prev + 1);
    setLoading(false);
  }, [farmerId]);

  useEffect(() => {
    setForms([]);
    setPage(1);
    setTotal(0);
    setHasMore(true);
    loadForms();
  }, [farmerId]);

  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadForms();
        }
      },
      { threshold: 1 },
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [loading, hasMore]);

  return (
    <>
      {!loading && forms.length === 0 && (
        <Typography sx={{ textAlign: 'center', pt: 3 }}>
          No hay formularios para mostrar
        </Typography>
      )}
      {forms &&
        forms.length > 0 &&
        forms.map((form) => {
          return (
            <Paper key={form.id} sx={{ mt: 1 }}>
              <TitleSectionStyled>{form.form.name ?? ''}</TitleSectionStyled>
              <Grid container spacing={2}>
                {form.detail.map((element: EntityDetail) => {
                  return (
                    <Grid size={{ xs: 12, md: 4 }} key={element.name}>
                      <CaptionStyled>
                        {element.display_name ?? ''}
                      </CaptionStyled>
                      {element.type_value === 'media' ? (
                        <Box
                          display={'flex'}
                          sx={{
                            '&:hover': {
                              cursor: 'pointer',
                            },
                          }}
                          justifyContent={'flex-start'}
                          alignItems={'center'}
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
                            ? element?.value
                                ?.map((v: any) => v.display_name)
                                .join(', ')
                            : String(element?.value?.display_name ?? '-')}
                          {/* {String(element?.value?.display_name ?? '-') ?? ''} */}
                        </FieldValueStyled>
                      ) : (
                        <FieldValueStyled>
                          {String(element.value ?? '-') ?? ''}
                        </FieldValueStyled>
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          );
        })}
      {loading && (
        <Typography sx={{ textAlign: 'center', py: 2 }}>
          Cargando formularios...
        </Typography>
      )}
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

export default FormsTab;
