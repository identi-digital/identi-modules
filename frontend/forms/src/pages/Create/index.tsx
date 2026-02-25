import {
  Box,
  Button,
  Card,
  CircularProgress,
  Paper,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import ModuleTypeTab from './Tabs/ModuleTypeTab';
import ModuleConfigurationTab from './Tabs/ModuleConfigurationTab';
import { Module, ModuleDefault } from '../../models/forms';
import { useFormik } from 'formik';
import * as yup from 'yup';
import ModuleNameTab from './Tabs/ModuleNameTab';
import { useNavigate, useParams } from 'react-router-dom';
// import routes from '~/routes/routes';
import { v4 as uuidv4 } from 'uuid';
import { showMessage, showYesNoQuestion } from '@ui/utils/Messages';
import { getListRoute } from '@/modules/forms';
import { FormService } from '../../services/forms';
import { ModuleConfig } from '@/core/moduleLoader';
// import { getPresignedURL, uploadImage } from '~/service/collection';
// import useModules from '~/atlas/modules';
// import useSchemaModules from '~/atlas/schema_module';

const stepsArray = [
  'Selecciona el tipo de formulario',
  'Configura el formulario',
  'Personaliza el formulario',
];

// type FormsCreatePageProps = unknown;
interface FormsCreateProps {
  config?: ModuleConfig;
}

export default function FormsCreatePage({ config }: FormsCreateProps) {
  const navigate = useNavigate();
  // eslint-disable-next-line
  // @ts-ignore
  const { id_module, type_entity } = useParams();
  // const { state } = useLocation();
  // console.log(state?.type ?? '');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  // console.log(id_module);
  const [hasId] = useState(id_module ? true : false);
  const [newLogo, setNewLogo] = useState<any>(undefined);
  const newModule: Module = ModuleDefault;

  // const { createModule, getModuleByObjectId, updateModule } = useModules();
  // const { createModuleSchema } = useSchemaModules();

  const validateFields = yup.object().shape({
    name: yup.string().required('Campo requerido.'),
  });

  const handleSaveNewImage = useCallback((image: any) => {
    setNewLogo(image);
  }, []);

  const handleCancel = () => {
    // if (state?.type === 'FREE') {
    //   navigate(routes.free_modules);
    // } else {
    // }
    navigate(getListRoute());
  };

  const formik = useFormik({
    initialValues: newModule,
    onSubmit: async (values: any) => {
      const moduleObj = Object.assign({}, values);
      let moduleId = moduleObj.id; // id
      let moduleSchemaId = moduleObj.schema_id; //schema_id
      if (!hasId) {
        //crear modulo
        if (moduleId === '') {
          moduleId = uuidv4();
          moduleObj.id = moduleId;
          moduleObj.tenant = localStorage.getItem('tenant_id');
        }

        // si hay imagen, la subo a s3
        // if (newLogo) {
        //   try {
        //     const name = `${newLogo.name}`.split('.')[0];
        //     const url_resp = await getPresignedURL(name, newLogo.type);
        //     const { url_presigned, key } = url_resp?.data?.data;
        //     if (url_presigned && key) {
        //       const upload_resp = await uploadImage(url_presigned, newLogo, `${newLogo?.type}`);
        //       if (upload_resp.status === 200) {
        //         moduleObj['image_path'] = key ?? '';
        //       }
        //     }
        //   } catch (error) {}
        // }

        if (moduleSchemaId === '') {
          //no tendría esquema y se procede a uno nuevo
          // moduleSchemaId = uuidv4();
          // moduleObj.schema_id = moduleSchemaId;
          const newSchema: any = {
            instructions: [],
            instruction_start: '',
          };
          // agregar la imagen del modulo
          // console.log('createModuleSchema', newSchema);
          // console.log('createModule', moduleObj);
          delete moduleObj['schema_id'];
          setIsCreating(true);
          FormService.createForm(moduleObj)
            .then((form_resp: any) => {
              if (form_resp) {
                // const news = {
                //   form_id: form_resp?.id,
                //   schema: newSchema,
                // };
                FormService.createFormSchema(form_resp?.id, {
                  schema: newSchema,
                })
                  .then((schema_resp: any) => {
                    if (schema_resp) {
                      moduleObj.schema_id = schema_resp?.id;
                      FormService.updateForm(form_resp?.id, moduleObj).then(
                        (update_form_resp: any) => {
                          if (update_form_resp) {
                            formik.setSubmitting(false);
                            showMessage(
                              '',
                              'Modulo creado correctamente',
                              'success',
                            );
                            navigate(getListRoute());
                            // navigate(`${routes.module_edit}/${moduleObj.idRef}`);
                          }
                        },
                      );
                    }
                  })
                  .catch(() => {
                    showMessage(
                      '',
                      'Problemas al crear el módulo, inténtelo nuevamente.',
                      'error',
                    );
                  })
                  .finally(() => {
                    setIsCreating(false);
                  });
              }
            })
            .catch(() => {
              showMessage(
                '',
                'Problemas al crear el módulo, inténtelo nuevamente.',
                'error',
              );
              setIsCreating(false);
            });
          // crear el formulario
          // crear el schema
          // actualizar el formulario para incluir el schema

          // createModuleSchema(newSchema)
          //   .then(() => {
          //     createModule(moduleObj)
          //       .then(() => {
          //         formik.setSubmitting(false);
          //         showMessage('', 'Modulo creado correctamente', 'success');
          //         navigate(`${routes.module_edit}/${moduleObj.idRef}`);
          //       })
          //       .catch(() => {
          //         showMessage('', 'Problemas al crear el módulo, inténtelo nuevamente.', 'error');
          //         formik.setSubmitting(false);
          //       });
          //   })
          //   .catch(() => {
          //     showMessage('', 'Problemas al crear el esquema del módulo, inténtelo nuevamente.', 'error');
          //     formik.setSubmitting(false);
          //   });
        } else {
          //guardar el moduleObj en bd
          console.log('createModule', moduleObj);
          // createModule(moduleObj)
          //   .then(() => {
          //     formik.setSubmitting(false);
          //     showMessage('', 'Modulo creado correctamente', 'success');
          //     navigate(`${routes.module_edit}/${moduleObj.idRef}`);
          //   })
          //   .catch(() => {
          //     showMessage('', 'Problemas al crear el módulo, inténtelo nuevamente.', 'error');
          //     formik.setSubmitting(false);
          //   });
        }
      } else {
        //editar modulo
        showYesNoQuestion(
          '',
          '¿Seguro de querer guardar los cambios realizados?',
          'info',
        ).then((val: any) => {
          if (val) {
            if (newLogo) {
              try {
                const name = `${newLogo.name}`.split('.')[0];
                const { objectId, ...newObj } = moduleObj;
                // delete moduleObj['_id'];
                console.log('getPresignedURL', name, newLogo.type);
                console.log('uploadImage');
                console.log('updateModule', objectId, newObj);
                // getPresignedURL(name, newLogo.type)
                //   .then((res) => {
                //     const { url_presigned, key } = res?.data?.data;
                //     if (url_presigned && key) {
                //       uploadImage(url_presigned, newLogo, `${newLogo?.type}`)
                //         .then((resp: any) => {
                //           // console.log(resp?.data?.url);
                //           if (resp.status === 200) {
                //             newObj['image_path'] = key ?? '';
                //             updateModule(objectId, newObj)
                //               .then(() => {
                //                 showMessage('', 'Módulo editado correctamente.', 'success');
                //                 formik.setSubmitting(false);
                //                 if (state?.type === 'FREE') {
                //                   navigate(routes.free_modules);
                //                 } else {
                //                   navigate(routes.collection);
                //                 }
                //               })
                //               .catch(() => {
                //                 formik.setSubmitting(false);
                //                 showMessage('', 'No se pudo editar el módulo, inténtelo nuevamente.', 'error');
                //               });
                //           }
                //         })
                //         .catch((_err) => {
                //           showMessage('', 'Tuvimos problemas para guardar la imagen del módulo.', 'error');
                //         });
                //     }
                //   })
                //   .catch(() => {
                //     showMessage('', 'Tuvimos problemas para guardar la imagen del módulo.', 'error');
                //   });
              } catch (error) {
                showMessage(
                  '',
                  'Tuvimos problemas para guardar la imagen del módulo.',
                  'error',
                );
              } finally {
                formik.setSubmitting(false);
              }
            } else {
              const { objectId, ...newObj } = moduleObj;
              // console.log(moduleObj);
              console.log('updateModule', objectId, newObj);
              // updateModule(objectId, newObj)
              //   .then(() => {
              //     showMessage('', 'Módulo editado correctamente.', 'success');
              //     formik.setSubmitting(false);
              //     if (state?.type === 'FREE') {
              //       navigate(routes.free_modules);
              //     } else {
              //       navigate(routes.collection);
              //     }
              //   })
              //   .catch((_err) => {
              //     // console.log(err);
              //     formik.setSubmitting(false);
              //     showMessage('', 'No se pudo editar el módulo, inténtelo nuevamente.', 'error');
              //   });
            }
          }
        });
      }
    },
    validationSchema: validateFields,
  });

  const handleNext = useCallback(() => {
    setActiveStep((prevActiveStep) => {
      const step = prevActiveStep + 1;
      return step;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setActiveStep((prevActiveStep) => {
      const step = prevActiveStep - 1;

      return step;
    });
  }, []);

  const handleChangeStep = useCallback((value: number) => {
    setActiveStep(value);
  }, []);

  const onSubmit = useCallback(async () => {
    await formik.setErrors({});
    formik.handleSubmit();
  }, [formik]);

  useEffect(() => {
    if (id_module) {
      //traer modulo de la bd
      setIsLoading(true);
      console.log('getModuleByObjectId', id_module);
      // getModuleByObjectId(id_module)
      //   .then((resp: any) => {
      //     setIsLoading(false);
      //     formik.setValues(resp);
      //   })
      //   .catch(() => {
      //     setIsLoading(false);
      //     showMessage('', 'No se pudo obtener los datos del modulo.', 'error');
      //     navigate(routes.collection);
      //   });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_module]);

  useEffect(() => {
    if (type_entity) {
      formik.setFieldValue('type_module', 'ENTITY');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type_entity]);

  // useEffect(() => {
  //   console.log(formik.values);
  //   // return () => {

  //   // };
  // }, [formik.values]);

  return (
    <>
      <Card sx={{ padding: 3 }}>
        <Stepper
          activeStep={activeStep}
          sx={{
            '&:hover': {
              cursor: 'pointer',
            },
            '& .MuiStepConnector-line': {
              borderTopWidth: '3px',
              borderColor: '#22C55E',
            },
          }}
        >
          {stepsArray.map((label, index: number) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: {
              optional?: React.ReactNode;
            } = {};
            return (
              <Step
                key={label}
                {...stepProps}
                onClick={() => hasId && handleChangeStep(index)}
                completed={hasId || activeStep > index}
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                  },
                  '& .MuiStepLabel-iconContainer svg': {
                    color: hasId || activeStep > index ? '#22C55E' : '#2F95E7',
                    marginRight: '1px',
                  },
                }}
              >
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Card>
      <Box mt={2}>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 2,
              marginTop: '4rem',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ padding: 2 }}>
            {activeStep === 0 && (
              <ModuleTypeTab
                handleOnSelectType={(type: string) => {
                  formik.setFieldValue('form_purpose', type);
                }}
                handleOnSelectFlowType={(type: string) => {
                  formik.setFieldValue('flow_type', type);
                }}
                handleOnSelectChannel={(channel: string) => {
                  formik.setFieldValue('channel_name', channel);
                }}
                channel_name={formik.values.channel_name}
                entityType={formik.values.form_purpose}
                flow_type={formik.values.flow_type}
                isConfigure={hasId}
              />
            )}
            {activeStep === 1 && <ModuleConfigurationTab formik={formik} />}
            {activeStep === 2 && (
              <ModuleNameTab
                formik={formik}
                handleSaveNewImage={handleSaveNewImage}
                hasId={hasId}
              />
            )}
            <Box mt={2} width={'100%'} textAlign={'end'}>
              {hasId ? (
                <>
                  {activeStep === 2 ? (
                    <>
                      <Button variant="contained" onClick={handlePrev}>
                        Anterior
                      </Button>
                      <Button
                        sx={{ marginLeft: '16px' }}
                        disabled={formik.isSubmitting}
                        variant="contained"
                        onClick={() => onSubmit()}
                      >
                        Guardar cambios
                      </Button>
                    </>
                  ) : (
                    <>
                      {activeStep === 0 && (
                        <>
                          <Button
                            variant="contained"
                            disabled={formik.isSubmitting}
                            onClick={handleCancel}
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ marginLeft: '16px' }}
                            disabled={
                              formik.values.module_type === 'FREE' &&
                              (!formik.values.channel_name ||
                                formik.values.channel_name === '')
                            }
                          >
                            Siguiente
                          </Button>
                        </>
                      )}
                      {activeStep === 1 && (
                        <>
                          <Button
                            variant="contained"
                            onClick={handlePrev}
                            sx={{ marginLeft: '16px' }}
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ marginLeft: '16px' }}
                            disabled={
                              formik.values.gps_tracking &&
                              formik.values.gps_tracking !== null &&
                              formik.values.gps_tracking.frequency === 0
                            }
                          >
                            Siguiente
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {activeStep === 2 ? (
                    <>
                      <Button
                        variant="contained"
                        disabled={formik.isSubmitting || isCreating}
                        onClick={handleCancel}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        sx={{ marginLeft: '16px' }}
                        onClick={handlePrev}
                        disabled={isCreating}
                      >
                        Anterior
                      </Button>

                      <Button
                        variant="contained"
                        sx={{ marginLeft: '16px' }}
                        disabled={formik.isSubmitting}
                        onClick={() => onSubmit()}
                        loading={isCreating}
                      >
                        Crear formulario
                      </Button>
                    </>
                  ) : (
                    <>
                      {activeStep === 0 && (
                        <>
                          <Button
                            variant="contained"
                            disabled={formik.isSubmitting}
                            onClick={handleCancel}
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ marginLeft: '16px' }}
                            disabled={
                              formik.values.module_type === 'FREE' &&
                              formik.values.channel_name === ''
                            }
                          >
                            Siguiente
                          </Button>
                        </>
                      )}
                      {activeStep === 1 && (
                        <>
                          <Button
                            variant="contained"
                            onClick={handlePrev}
                            sx={{ marginLeft: '16px' }}
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ marginLeft: '16px' }}
                            disabled={
                              formik.values.gps_tracking !== null &&
                              formik.values.gps_tracking.frequency === 0
                            }
                          >
                            Siguiente
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </Box>
          </Paper>
        )}
      </Box>
    </>
  );
}

// export default FormsCreatePage;
