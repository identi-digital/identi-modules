import { Box, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CaptionStyled, FieldValueStyled, TitleSectionStyled } from '..';
import Paper from '@/ui/components/atoms/Paper/Paper';
import Button from '@/ui/components/atoms/Button/Button';
import PolygonDialog from '../components/PolygonDialog';
// import { Farm } from '../../../models/farmer';
import { Crop, FarmGet } from '../../../models/farm';
import { FarmerService } from '../../../services/farmer';
import UploadGeoFile from '../components/UploadGeoFile';
import { FarmService } from '../../../services/farm';
import { showMessage } from '@/ui/utils/Messages';
import { FarmerGet } from '../../../models/farmer';

type FarmsTabProps = {
  // farmerId: string;
  farmer: FarmerGet;
};

const FarmsTab: React.FC<FarmsTabProps> = (props: FarmsTabProps) => {
  const { farmer } = props;
  const [farmSelected, setFarmSelected] = useState<FarmGet | null>(null);
  const [openPolygonDialog, setOpenPolygonDialog] = useState<boolean>(false);

  const [farms, setFarms] = useState<FarmGet[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadingPolygon, setUploadingPolygon] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const loadFarms = useCallback(async () => {
    if (loading) return;
    if (total && farms.length >= total) return;

    setLoading(true);

    const res = await FarmerService.getFarmsByFarmerId(
      farmer.id,
      page,
      perPage,
    );

    if (res.items.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    setFarms((prev) => {
      const map = new Map(prev.map((f: FarmGet) => [f.id, f]));
      res.items.forEach((f: FarmGet) => map.set(f.id, f));
      return Array.from(map.values());
    });

    setTotal(res.total);
    setPage((prev) => prev + 1);
    setLoading(false);
  }, [loading, total, farms.length, page, farmer.id, perPage]);

  const handlePolygonDialog = () => {
    setOpenPolygonDialog((prevState) => !prevState);
  };
  function geometryCollectionToFeatureCollection(gc: any) {
    return {
      type: 'FeatureCollection',
      features: gc.geometries.map((geometry: any, index: number) => ({
        type: 'Feature',
        geometry,
        properties: {
          id: index,
        },
      })),
    };
  }
  const handleOnUploadFile = useCallback(
    (data: any, farm: any) => {
      if (!farm) {
        showMessage('', 'Seleccione un parcela', 'error', true);
        return;
      }
      if (farm.id && farm.id !== '') {
        let geoJson: any = null;
        const typeCollection = data?.type;
        geoJson = data;
        if (typeCollection === 'GeometryCollection') {
          geoJson = geometryCollectionToFeatureCollection(data);
        }
        if (geoJson) {
          setUploadingPolygon(true);
          FarmService.uploadFarmGeometry(farm.id, {
            geojson: geoJson,
            is_principal: true,
          })
            .then((_resp: any) => {
              setOpenPolygonDialog(false);
              setFarms([]);
              setPage(1);
              setTotal(0);
              setHasMore(true);
              // console.log(resp);
            })
            .catch((err: any) => {
              console.log(err);
              showMessage('', 'Problemas al subir el polígono', 'error', true);
            })
            .finally(() => {
              setUploadingPolygon(false);
            });
          // }
        }
      }
    },
    [farmSelected],
  );

  useEffect(() => {
    if (page === 1 && farms.length === 0) {
      loadFarms();
    }
  }, [loadFarms]);

  useEffect(() => {
    setFarms([]);
    setPage(1);
    setTotal(0);
    setHasMore(true);
    setFarmSelected(null);
  }, [farmer.id]);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading) {
        if (!hasMounted.current) {
          hasMounted.current = true;
          return;
        }
        loadFarms();
      }
    });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadFarms]);

  return (
    <>
      {/* {loading && (
        <Typography sx={{ textAlign: 'center', py: 2 }}>
          Cargando parcelas...
        </Typography>
      )} */}
      {!loading && farms.length === 0 && (
        <Typography sx={{ textAlign: 'center', pt: 3 }}>
          No hay parcelas para mostrar
        </Typography>
      )}
      {farms &&
        farms.length > 0 &&
        farms.map((farm) => {
          return (
            <Paper key={farm.id} sx={{ mt: 1 }}>
              <TitleSectionStyled>{farm.name ?? 'Parcela'}</TitleSectionStyled>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CaptionStyled>Area total (Ha)</CaptionStyled>
                  <FieldValueStyled>{farm.total_area}</FieldValueStyled>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CaptionStyled>Area cultivada (Ha)</CaptionStyled>
                  <FieldValueStyled>{farm.cultivated_area}</FieldValueStyled>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CaptionStyled>Cultivo principal</CaptionStyled>
                  <FieldValueStyled>
                    {farm.crops && farm.crops.length > 0
                      ? farm.crops.map((c: Crop) => c.name).join(', ')
                      : '-'}
                  </FieldValueStyled>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CaptionStyled>País</CaptionStyled>
                  <FieldValueStyled>
                    {farm.country?.name ?? '-'}
                  </FieldValueStyled>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CaptionStyled>Departamento</CaptionStyled>
                  <FieldValueStyled>
                    {farm.department?.name ?? '-'}
                  </FieldValueStyled>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CaptionStyled>Provincia</CaptionStyled>
                  <FieldValueStyled>
                    {farm.province?.name ?? '-'}
                  </FieldValueStyled>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CaptionStyled>Distrito</CaptionStyled>
                  <FieldValueStyled>
                    {farm.district?.name ?? '-'}
                  </FieldValueStyled>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CaptionStyled>Latitud</CaptionStyled>
                  <FieldValueStyled>{farm.latitude ?? '-'}</FieldValueStyled>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CaptionStyled>Longitud</CaptionStyled>
                  <FieldValueStyled>{farm.longitude ?? '-'}</FieldValueStyled>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                {farm.geometry ? (
                  <Button
                    text="Ver polígono"
                    variant="contained"
                    onClick={() => {
                      setFarmSelected(farm);
                      handlePolygonDialog();
                    }}
                  />
                ) : (
                  <UploadGeoFile
                    text="Subir polígono"
                    handleOnUploadFile={handleOnUploadFile}
                    farm={farm}
                    loading={uploadingPolygon}
                  />
                )}
              </Box>
            </Paper>
          );
        })}
      <Box ref={observerRef} sx={{ height: 40 }} />
      {loading && (
        <Typography sx={{ textAlign: 'center', py: 2 }}>
          Cargando parcelas...
        </Typography>
      )}
      {openPolygonDialog && farmSelected && (
        <PolygonDialog
          handleCloseDialog={handlePolygonDialog}
          farm_name={farmSelected?.name ?? ''}
          farm={farmSelected}
          farmer={farmer}
          open={openPolygonDialog}
          handleOnUploadFile={handleOnUploadFile}
        />
      )}
    </>
  );
};

export default FarmsTab;
