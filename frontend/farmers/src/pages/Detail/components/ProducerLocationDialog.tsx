import React, { useCallback, useEffect, useState } from 'react';
import { FarmerLocation } from '../../../models/farmer';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Dialog from '@/ui/components/molecules/Dialog/Dialog';
import { Box, Grid, InputLabel } from '@mui/material';
import Button from '@/ui/components/atoms/Button/Button';
import { LocationsService } from '@/services/locations';
import Autocomplete from '@/ui/components/atoms/Autocomplete/Autocomplete';
import { showMessage } from '@/ui/utils/Messages';

type ProducerLocationDialogProps = {
  farmerLocation: FarmerLocation;
  open: boolean;
  handleClose: () => void;
  handleSave: (id: string, farmerLocation: any) => void;
};

const ProducerLocationDialog: React.FC<ProducerLocationDialogProps> = (
  props: ProducerLocationDialogProps,
) => {
  const { farmerLocation, open, handleClose, handleSave } = props;
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

  const newFarmerLocation: FarmerLocation = {
    id: farmerLocation.id,
    country_id: farmerLocation.country_id,
    department_id: farmerLocation.department_id,
    province_id: farmerLocation.province_id,
    district_id: farmerLocation.district_id,
  };

  const validationSchema = yup.object().shape({
    country_id: yup.string().required('Requerido'),
    department_id: yup.string().required('Requerido'),
    province_id: yup.string().required('Requerido'),
    district_id: yup.string().required('Requerido'),
  });

  const formik = useFormik({
    initialValues: newFarmerLocation,
    onSubmit: (value: FarmerLocation) => {
      console.log(value);
      const prevFarmerLocation = Object.assign({}, value);
      handleSave(value.id, prevFarmerLocation);
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
      farmerLocation.country_id !== '' &&
      farmerLocation.country_id !== null &&
      farmerLocation.country_id !== undefined
    ) {
      LocationsService.getCountries(1, 100, 'name', 'asc', '')
        .then((resp: any) => {
          if (resp) {
            setCountries(resp.items);
            formik.setFieldValue('country_id', farmerLocation.country_id);
            handleListAllDepartmentsOfCountry(farmerLocation.country_id);
            if (
              farmerLocation.department_id !== '' &&
              farmerLocation.department_id !== null &&
              farmerLocation.department_id !== undefined
            ) {
              formik.setFieldValue(
                'department_id',
                farmerLocation.department_id,
              );
              handleListAllProvincesOfDepartment(farmerLocation.department_id);
              setRefreshDepartment((prevValue: boolean) => !prevValue);
              if (
                farmerLocation.province_id !== '' &&
                farmerLocation.province_id !== null &&
                farmerLocation.province_id !== undefined
              ) {
                formik.setFieldValue('province_id', farmerLocation.province_id);
                handleListAllDistrictsOfProvince(
                  farmerLocation.province_id ?? '',
                );
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
      title={'Datos geográficos'}
      subtitle={'Datos secundarios'}
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

export default ProducerLocationDialog;
