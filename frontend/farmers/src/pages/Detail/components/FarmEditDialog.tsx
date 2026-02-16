import React, { useCallback, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Dialog from '@/ui/components/molecules/Dialog/Dialog';
import { Box, Grid, InputLabel } from '@mui/material';
import Button from '@/ui/components/atoms/Button/Button';
import { LocationsService } from '@/services/locations';
import Autocomplete from '@/ui/components/atoms/Autocomplete/Autocomplete';
import { showMessage } from '@/ui/utils/Messages';
import { FarmGet } from '../../../models/farm';
import TextField from '@/ui/components/atoms/TextField/TextField';

type FarmEditDialogProps = {
  farm: FarmGet;
  open: boolean;
  handleClose: () => void;
  handleSave: (id: string, farm: any) => void;
};

const FarmEditDialog: React.FC<FarmEditDialogProps> = (
  props: FarmEditDialogProps,
) => {
  const { farm, open, handleClose, handleSave } = props;
  const [refreshCountry] = useState<boolean>(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [refreshDepartment, setRefreshDepartment] = useState<boolean>(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState<boolean>(
    false,
  );
  const [provinces, setProvinces] = useState<any[]>([]);
  const [isProvincesLoading, setIsProvincesLoading] = useState<boolean>(false);
  const [districts, setDistricts] = useState<any[]>([]);
  const [isDistrictsLoading, setIsDistrictsLoading] = useState<boolean>(false);

  const newFarm: any = {
    id: farm.id,
    name: farm.name ?? '',
    total_area: farm.total_area ?? 0,
    cultivated_area: farm.cultivated_area ?? 0,
    latitude: farm.latitude ?? null,
    longitude: farm.longitude ?? null,
    // crops: farm.crops ?? [],
    country_id: farm.country_id ?? null,
    department_id: farm.department_id ?? null,
    province_id: farm.province_id ?? null,
    district_id: farm.district_id ?? null,
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required('El nombre de la parcela es requerido'),
    total_area: yup.number().required('El área total es requerida'),
    cultivated_area: yup.number().required('El área cultivada es requerida'),
    country_id: yup.string().required('El país es requerido'),
    // department_id: yup.string().required('Requerido'),
    // province_id: yup.string().required('Requerido'),
    // district_id: yup.string().required('Requerido'),
  });

  const formik = useFormik({
    initialValues: newFarm,
    onSubmit: (value: any) => {
      console.log(value);
      const prevFarm = Object.assign({}, value);
      handleSave(value.id, prevFarm);
    },
    validationSchema,
  });

  const onSubmit = useCallback(async () => {
    await formik.setErrors({});
    formik.handleSubmit();
  }, [formik]);

  const handleListAllDepartmentsOfCountry = useCallback(
    async (country_id: string) => {
      setIsDepartmentsLoading(true);
      try {
        const departmentsList = await LocationsService.getDepartments(
          1,
          100,
          'name',
          'asc',
          '',
          country_id,
        );
        if (
          departmentsList &&
          departmentsList.items &&
          departmentsList.items.length === 0
        ) {
          setIsDepartmentsLoading(false);
          return;
        }
        setDepartments(departmentsList.items);
      } finally {
        setIsDepartmentsLoading(false);
      }
    },
    [],
  );

  const handleListAllProvincesOfDepartment = useCallback(
    async (department_id: string) => {
      setIsProvincesLoading(true);
      try {
        const provincesList = await LocationsService.getProvinces(
          1,
          100,
          'name',
          'asc',
          '',
          department_id,
        );
        if (
          provincesList &&
          provincesList.items &&
          provincesList.items.length === 0
        ) {
          setIsProvincesLoading(false);
          return;
        }
        setProvinces(provincesList.items);
      } finally {
        setIsProvincesLoading(false);
      }
    },
    [],
  );

  const handleListAllDistrictsOfProvince = useCallback(
    async (province_id: string) => {
      setIsDistrictsLoading(true);
      try {
        const districtsList = await LocationsService.getDistricts(
          1,
          100,
          'name',
          'asc',
          '',
          province_id,
        );
        if (
          districtsList &&
          districtsList.items &&
          districtsList.items.length === 0
        ) {
          setIsDistrictsLoading(false);
          return;
        }
        setDistricts(districtsList.items);
      } finally {
        setIsDistrictsLoading(false);
      }
    },
    [],
  );

  const handleOnChangeCountry = useCallback(
    (name: string, value: any) => {
      formik.setFieldValue(name, value);
      formik.setFieldValue('department_id', '');
      formik.setFieldValue('province_id', '');
      formik.setFieldValue('district_id', '');
      setDepartments([]);
      setProvinces([]);
      setDistricts([]);

      if (value !== null) {
        handleListAllDepartmentsOfCountry(value);
      }
    },
    [formik, handleListAllDepartmentsOfCountry],
  );
  const handleOnChangeDepartment = useCallback(
    (name: string, value: any) => {
      formik.setFieldValue(name, value);
      formik.setFieldValue('province_id', '');
      formik.setFieldValue('district_id', '');
      setProvinces([]);
      setDistricts([]);

      if (value !== null) {
        handleListAllProvincesOfDepartment(value);
      }
    },
    [formik, handleListAllProvincesOfDepartment],
  );
  const handleOnChangeProvince = useCallback(
    (name: string, value: any) => {
      formik.setFieldValue(name, value);
      formik.setFieldValue('district_id', '');
      setDistricts([]);

      if (value !== null) {
        formik.setFieldValue(name, value);
        handleListAllDistrictsOfProvince(value);
      }
    },
    [formik, handleListAllDistrictsOfProvince],
  );
  const handleOnChangeDistrict = useCallback(
    (name: string, value: any) => {
      formik.setFieldValue(name, value);
    },
    [formik],
  );

  useEffect(() => {
    if (
      farm.country_id !== '' &&
      farm.country_id !== null &&
      farm.country_id !== undefined
    ) {
      LocationsService.getCountries(1, 100, 'name', 'asc', '')
        .then((resp: any) => {
          if (resp) {
            setCountries(resp.items);
            formik.setFieldValue('country_id', farm.country_id);
            if (
              farm.country_id !== '' &&
              farm.country_id !== null &&
              farm.country_id !== undefined
            ) {
              handleListAllDepartmentsOfCountry(farm.country_id);
              if (
                farm.department_id !== '' &&
                farm.department_id !== null &&
                farm.department_id !== undefined
              ) {
                formik.setFieldValue('department_id', farm.department_id);
                handleListAllProvincesOfDepartment(farm.department_id);
                setRefreshDepartment((prevValue: boolean) => !prevValue);
                if (
                  farm.province_id !== '' &&
                  farm.province_id !== null &&
                  farm.province_id !== undefined
                ) {
                  formik.setFieldValue('province_id', farm.province_id);
                  handleListAllDistrictsOfProvince(farm.province_id ?? '');
                }
              }
            }
          }
        })
        .catch(() => {
          showMessage('', 'No se pudo obtener el país', 'error');
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      title={'Datos de la parcela'}
      subtitle={'Datos principales'}
      actions={
        <Box
          display="flex"
          justifyContent={'space-between'}
          width={'100%'}
          p={2}
        >
          <Button onClick={handleClose} variant="outlined" text="Cancelar" />
          <Button
            onClick={onSubmit}
            variant="contained"
            text="Guardar cambios"
          />
        </Box>
      }
    >
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel id={'name'} shrink={true}>
            Nombre
          </InputLabel>
          <TextField
            id="name"
            name="name"
            type="text"
            variant="outlined"
            size="small"
            label=""
            value={formik.values.name}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel id={'total_area'} shrink={true}>
            Area total (Ha)
          </InputLabel>
          <TextField
            id="total_area"
            name="total_area"
            type="number"
            variant="outlined"
            size="small"
            label=""
            value={formik.values.total_area}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel id={'cultivated_area'} shrink={true}>
            Area cultivada (Ha)
          </InputLabel>
          <TextField
            id="cultivated_area"
            name="cultivated_area"
            type="number"
            variant="outlined"
            size="small"
            label=""
            value={formik.values.cultivated_area}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        {/* <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel id={'crops'} shrink={true}>
            Cultivos
          </InputLabel>
          <TextField
            id="crops"
            name="crops"
            type="text"
            variant="outlined"
            size="small"
            label=""
            value={formik.values.crops}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid> */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel id={'latitude'} shrink={true}>
            Latitud
          </InputLabel>
          <TextField
            id="latitude"
            name="latitude"
            type="number"
            variant="outlined"
            size="small"
            label=""
            value={formik.values.latitude}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel id={'longitude'} shrink={true}>
            Longitud
          </InputLabel>
          <TextField
            id="longitude"
            name="longitude"
            type="number"
            variant="outlined"
            size="small"
            label=""
            value={formik.values.longitude}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel id={'country_id'} shrink={true}>
            País
          </InputLabel>
          <Autocomplete
            id="country_id"
            name="country_id"
            label=""
            items={countries || []}
            onChange={handleOnChangeCountry}
            value={formik.values.country_id}
            selectedValue={formik.values.country_id}
            defaultValue={null}
            itemText="description"
            itemValue="id"
            disabled={formik.isSubmitting}
            refresh={refreshCountry}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel id={'department_id'} shrink={true}>
            Departamento
          </InputLabel>
          <Autocomplete
            id="department_id"
            name="department_id"
            label=""
            items={departments}
            isDataLoading={isDepartmentsLoading}
            onChange={handleOnChangeDepartment}
            value={formik.values.department_id}
            selectedValue={formik.values.department_id}
            defaultValue={null}
            itemText="description"
            itemValue="id"
            disabled={formik.isSubmitting}
            refresh={refreshDepartment}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel id={'province_id'} shrink={true}>
            Provincia
          </InputLabel>
          <Autocomplete
            id="province_id"
            name="province_id"
            label=""
            items={provinces}
            isDataLoading={isProvincesLoading}
            onChange={handleOnChangeProvince}
            value={formik.values.province_id}
            selectedValue={formik.values.province_id}
            defaultValue={null}
            itemText="description"
            itemValue="id"
            disabled={formik.isSubmitting}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel id={'district_id'} shrink={true}>
            Distrito
          </InputLabel>
          <Autocomplete
            id="district_id"
            name="district_id"
            label=""
            items={districts}
            isDataLoading={isDistrictsLoading}
            onChange={handleOnChangeDistrict}
            value={formik.values.district_id}
            selectedValue={formik.values.district_id}
            defaultValue={null}
            itemText="description"
            itemValue="id"
            disabled={formik.isSubmitting}
          />
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default FarmEditDialog;
