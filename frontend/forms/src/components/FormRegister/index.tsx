import React, { useCallback, useEffect, useState } from 'react';
import { Box, Card, Grid, Typography, useTheme } from '@mui/material';

// import useSchemaModules from '~/atlas/schema_module';
import { showMessage, showYesNoQuestion } from '@ui/utils/Messages';
import { useNavigate } from 'react-router-dom';
// import routes from '~/routes/routes';
import {
  EntityNameTypes,
  Instruction,
  Metadata,
  Module,
  ModuleSession,
  ModuleSessionDefault,
  OnAction,
  SchemaGatherMetadata,
  SchemaInput,
  SchemaVariable,
} from '../../models/forms';
import LinearProgress from '@ui/components/atoms/LinearProgress/LinearProgress';
import { v4 as uuidv4 } from 'uuid';
import {
  EntityDetailMetadata,
  // Entity,
  EntityDetail,
  EntityExternalRelationsArray,
  EntityRelations,
  // Location,
} from '../../models/entities';
// import { capitalizeAllWords } from '~/utils/Word';
// import useEntity from '~/atlas/entities';
// import { schemaNamesEntities } from '~/atlas';
// import LocationEntity from '@ui/components/shared/locationEntity';
// import useModules, { collectionNames } from '~/atlas/modules';
// import {
//   getDeforestIndicatorValue,
//   getDetailValue,
//   getRepresentativeValue,
// } from '@ui/utils/EntityUtils';
// import api_media_s3 from '~/service/api_media_s3';
import Button from '@ui/components/atoms/Button/Button';
// import { translateText } from '@ui/components/shared/translation';
import FieldEntity from '../FieldEntity';
// import { modulesConfig } from '~/atlas/modules/modulesConfig';
// import RenderGFWStatus from '@ui/components/atoms/GfwStatus';
// import { BalanceMovement, MovementType } from '~/models/movements';
// import useMovements from '~/atlas/balance_movements';
// import { useAuthApp } from '~/ui/App/AuthContext';
// import useModuleSession from '~/atlas/module_session';
// import { capitalizeAllWords } from '@ui/utils/Word';
import { getListRoute } from '@/modules/forms';
import { FormService } from '../../services/forms';
import { CoreRegister } from '../../models/core_register';
import { useAuth } from '@/core/auth/AuthContext';
// import DinamicForm from './DinamicForm';

type RegisterModuleComponentProps = {
  module: Module;
  handleCancelRegisterView: () => void;
  isModal?: boolean;
  beforeRegister?: () => void;
};

type Option = {
  id: string;
  display_name: string;
  description: string;
  module_name?: string;
  module_id: string;
  owner?: string;
  deforest_value?: string;
};

type entityValues = {
  instruction_id: string;
  values: Option[];
  page: number;
  per_page: number;
  total: number;
  idSelected: string;
  filter: string;
  loading?: boolean;
  search?: string;
};

type actionsTypes = {
  instruction_id: string;
  on_action: OnAction;
  schema_variables: SchemaVariable[];
  schema_input: SchemaInput[];
};

type dataVars = {
  name: string;
  value: any;
};
// type filterFields = {
//   filtered_field: string;
//   filter_field: string;
// };
// const PLANT_MODULE_ID = '4b9bbb3a-8a48-4945-8830-52081bfa593c';
// const COB_MODULE_ID = 'f56bc2d7-face-4ff9-ab2c-c34f73003627';
// const FLOWER_MODULE_ID = 'e07044c8-d430-4b5b-9090-fd48d1f8e40c';

// // const QUESTION_FARM_ID = '7223c167-110a-4e42-a529-a0b0819f9e4a';
// const QUESTION_POLYGON_ID = '043d4e85-ed06-4ede-a8ea-dc63391222ed';
// const EXCLUDES_TYPES = ['geojson'];

const RegisterModuleComponent: React.FC<RegisterModuleComponentProps> = (
  props: RegisterModuleComponentProps,
) => {
  const {
    module,
    handleCancelRegisterView,
    isModal = false,
    beforeRegister,
  } = props;
  const themes = useTheme();
  const navigate = useNavigate();
  // const { atlasApp } = useRealmApp();
  const { user } = useAuth();
  // console.log(user);
  // const {
  //   createEntity,
  //   addRelationToEntity,
  //   validateEntityUniqueField,
  //   saveLocationEntity,
  //   getAnyEntityById,
  // } = useEntity(schemaNamesEntities[module.entity_type ?? 'PERSON']);
  const [newSession, setNewSession] = useState<ModuleSession>(
    ModuleSessionDefault,
  );
  // const { createMovement } = useMovements();
  // const { createModuleSession } = useModuleSession();
  // const { getModuleSchemaById } = useSchemaModules();
  // const { getEntitiesByModuleId } = useModules();
  const [entityValuesArray, setEntityValuesArray] = useState<entityValues[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [entityDetail, setEntityDetail] = useState<EntityDetailMetadata[]>([]);
  const [entityRelations, setEntityRelations] = useState<EntityRelations[]>([]);
  // const [externalEntityRelations, setExternalEntityRelations] = useState<
  //   EntityExternalRelationsArray[]
  // >([]);
  const [actionsInstructions, setActionsInstructions] = useState<
    actionsTypes[]
  >([]);
  const [varsActionsInstructions, setVarsActionsInstructions] = useState<
    dataVars[]
  >([]);
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [visibleQuestions, setVisibleQuestions] = useState<string[]>([]);

  // const [newLocation, setNewLocation] = useState<Location>({
  //   country_id: '',
  //   department_id: '',
  //   province_id: '',
  //   district_id: '',
  // });

  // const onChangeLocation = useCallback((location: Location) => {
  //   setNewLocation(location);
  // }, []);

  // const handleSaveEntityLocation = useCallback(
  //   (entityId: string) => {
  //     if (newLocation.country_id !== '') {
  //       console.log('saveLocationEntity', entityId, newLocation);
  //       // saveLocationEntity(entityId, newLocation);
  //     }
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [newLocation],
  // );

  const handleSaveSession = useCallback(
    (entityIdRef: string, entityType: EntityNameTypes) => {
      const saveNewSession: ModuleSession = {
        ...newSession,
        entity: { id: entityIdRef, type: entityType },
        duration: new Date().getTime() - newSession.created_at.getTime(),
        updated_at: new Date(),
      };
      // console.log(newSession);
      // createModuleSession(saveNewSession);
      console.log('createModuleSession', saveNewSession);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newSession],
  );

  const updateErrorsAndTouch = (key: string) => {
    setErrors((prev: any) => {
      const newObj = Object.assign({}, prev);
      delete newObj[key];

      return newObj;
    });
    setTouched((prev: any) => {
      const newObj = Object.assign({}, prev);
      delete newObj[key];

      return newObj;
    });
  };
  const handleShowError = (name: string, message: string) => {
    setErrors((prevValue: any) => {
      return { ...prevValue, [name]: message };
    });
    setTouched((prevValue: any) => {
      return { ...prevValue, [name]: true };
    });
  };
  const handleValidateField = (
    metadata: Metadata,
    name: string,
    value: any,
  ): boolean => {
    const isValid = true;
    if (value === '') {
      return isValid;
    }
    const { min, max, max_length, min_length, type } = metadata?.data_input;
    //validation
    if (type === 'number') {
      if (min || max) {
        if (value < +min) {
          handleShowError(name, `El valor mínimo es ${min}`);
          return false;
        }
        if (value > +max) {
          handleShowError(name, `El valor máximo es ${max}`);
          return false;
        }
      }
    }
    if (type === 'text') {
      if (max_length && typeof value === 'string') {
        if (value.length > +max_length) {
          handleShowError(name, `La longitud máxima es ${+max_length}`);
          return false;
        }
      }
      if (min_length && typeof value === 'string') {
        if (value.length < +min_length) {
          handleShowError(name, `La longitud mínima es ${+min_length}`);
          return false;
        }
      }
    }

    return isValid;
  };

  const updateEntityDetail = (id: string, value: any) => {
    // console.log(id, value);
    setEntityDetail((prevItems: EntityDetailMetadata[]) =>
      prevItems.map((item: EntityDetailMetadata) => {
        if (item.id === id) {
          updateErrorsAndTouch(item.name);
          if (item.metadata) {
            const _isValid = handleValidateField(
              item.metadata,
              item.name,
              value,
            );
          }
          return { ...item, value: value };
        }
        return item;
      }),
    );
  };

  const [filteredFields, setFilteredFields] = useState<any>({});
  // const [activeFarmFilter, setActiveFarmFilter] = useState<boolean>(false);
  // const [activePlantFilter, setActivePlantFilter] = useState<boolean>(false);
  // const [activeCobFilter, setActiveCobFilter] = useState<boolean>(false);
  // const [activeFlowerFilter, setActiveFlowerFilter] = useState<boolean>(false);

  // const [producerSelected, setProducerSelected] = useState<any>(null);
  // const [farmSelected, setFarmSelected] = useState<any>(null);
  // const [plantSelected, setPlantSelected] = useState<any>(null);

  // const [questionFarmId, setQuestionFarmId] = useState<string>('');
  // const [questionPlantId, setQuestionPlantId] = useState<string>('');
  // const [questionCobId, setQuestionCobId] = useState<string>('');
  // const [questionFlowerId, setQuestionFlowerId] = useState<string>('');

  const handleUpdateArrayEntitiesValues = useCallback(
    async (id: string, name: string, value: any) => {
      console.log(id);
      console.log(name);
      console.log(value);
      console.log(entityValuesArray);
      console.log(filteredFields);
      const idToUpdate = filteredFields[`${name}`];
      if (idToUpdate && typeof value === 'object') {
        const entity = entityValuesArray.find(
          (value: entityValues) => value.instruction_id === idToUpdate,
        );

        if (entity && entity.filter && entity.filter !== '') {
          // entity.loading = true;
          // setEntityValuesArray((prev: entityValues[]) => [...prev, entity]);
          let strNew = entity.filter.replace(/\{\{.*?\}\}/g, value?.id);

          const newOptions = await FormService.getListEntitiesData(
            entity.idSelected,
            1,
            100,
            'name',
            'asc',
            '',
            '',
            strNew,
          );
          if (newOptions) {
            const { items, page, per_page, total } = newOptions;
            const newItems: Option[] = items.map((element: any) => {
              // console.log(element);
              const option: Option = {
                id: element.id,
                display_name: element.name,
                description: element.name,
                module_id: entity.idSelected,
                module_name: entity.idSelected,
              };

              return option;
            });
            // console.log(newOptions);
            entity.values = newItems ?? [];
            entity.page = page;
            entity.per_page = per_page;
            entity.total = total;
            entity.loading = false;
            setEntityValuesArray((prev: entityValues[]) => [...prev, entity]);
          }
        }
        //  obtengo las nuevas entidades filtradas
      }
    },
    [entityValuesArray, filteredFields],
  );

  const updateEntityFieldValue = useCallback(
    (id: string, name: string, value: any) => {
      handleUpdateArrayEntitiesValues(id, name, value);
      // filtro para parcelas por productor
      // if (
      //   activeFarmFilter &&
      //   value?.module_id === modulesConfig.PRODUCER_MODULE_UUID
      // ) {
      //   setProducerSelected(value);
      //   // console.log(entityValuesArray);
      // }
      // // filtro para plantas por parcela
      // // bd65f8f6-818a-4996-9b69-fd093963128f -> parcelas
      // if (
      //   activePlantFilter &&
      //   value?.module_id === modulesConfig.PRODUCTIVE_MODULE_UUID
      // ) {
      //   setFarmSelected(value);
      //   // console.log(entityValuesArray);
      // }
      // // filtro para mazorcas por planta
      // // 4b9bbb3a-8a48-4945-8830-52081bfa593c -> plantas
      // if (activeCobFilter && value?.module_id === PLANT_MODULE_ID) {
      //   setPlantSelected(value);
      //   // console.log(entityValuesArray);
      // }
      // //filtro para flores por planta
      // if (activeFlowerFilter && value?.module_id === PLANT_MODULE_ID) {
      //   setPlantSelected(value);
      //   // console.log(entityValuesArray);
      // }

      updateEntityDetail(id, value);
      // setEntityRelations((prevItems: EntityRelations[]) =>
      //   prevItems.map((item: EntityRelations) =>
      //     item.detail_id === id
      //       ? {
      //           ...item,
      //           entity_id: value?.id ?? '',
      //           representative_value: value.display_name ?? '',
      //           module_id: value?.module_id ?? '',
      //           module_name: value?.module_name ?? '',
      //           entity_type: value?.description,
      //           created_at: new Date().toString(),
      //         }
      //       : item,
      //   ),
      // );
      // setExternalEntityRelations((prev: EntityExternalRelationsArray[]) =>
      //   prev.map((item: EntityExternalRelationsArray) =>
      //     item.detail_id === id
      //       ? {
      //           ...item,
      //           id_to: value?.id ?? '',
      //           type_to: value?.description,
      //         }
      //       : item,
      //   ),
      // );
    },

    [handleUpdateArrayEntitiesValues],
  );

  const verifyVarsMatches = (value: string): string[] => {
    const regex = /\{\{([^{}]+)\}\}/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(value)) !== null) {
      // Capturar el contenido entre llaves, eliminando espacios
      const content = match[1].trim();

      // Si hay campos anidados, separar y agregar cada uno a la lista
      const nestedFields = content.split(/\s+/);
      nestedFields.forEach((field) => {
        if (!matches.includes(field)) {
          matches.push(field);
        }
      });
    }
    return matches;
  };
  type ActionsResponseType = {
    entity_relations: EntityRelations[];
    entity_detail: EntityDetail[];
  };
  const verifyActionsInstructions = useCallback(
    (detail: any[], entity_id: string): Promise<ActionsResponseType | null> => {
      return new Promise<ActionsResponseType | null>((resolve, _reject) => {
        if (actionsInstructions.length > 0) {
          const newResponse: ActionsResponseType = {
            entity_detail: [],
            entity_relations: [],
          };
          for (let i = 0; i < actionsInstructions.length; i++) {
            const action: actionsTypes = actionsInstructions[i];
            //create body request
            let obj: any = {};
            action.schema_input.forEach((element: SchemaInput) => {
              if (typeof element.value === 'string') {
                const arrVarsInValue = verifyVarsMatches(element.value);
                if (arrVarsInValue.length > 0) {
                  arrVarsInValue.forEach((nameVar: string) => {
                    const { value } = detail.find(
                      (det: any) => det.name === nameVar,
                    );
                    if (value) {
                      obj = { ...obj, [element.name ?? '']: value };
                    }
                  });
                }
              }
            });
            //get data
            console.log('api_media_s3', action.on_action.location, obj);
            // api_media_s3
            //   .post(action.on_action.location, obj, {
            //     ApiKey: action.on_action.api_key,
            //     tenant: localStorage.getItem('tenant_id'),
            //     module_session_id: entity_id,
            //   })
            //   .then((resp: any) => {
            //     const { data } = resp?.data;
            //     if (data) {
            //       action.schema_variables.forEach((element: SchemaVariable) => {
            //         if (element.is_module_attr) {
            //           const newDet: any = {
            //             id: uuidv4(), //
            //             name: element.name,
            //             value: null,
            //             type_media: null,
            //             is_representative: element.is_representative,
            //             type_value: element.type_value,
            //             type_list_value: element.list_type_value ?? null,
            //             order: 0,
            //             is_unique: element.is_unique ?? false,
            //             is_optional: element.is_optional ?? true,
            //             instruction_id: action.instruction_id,
            //             option: element.option,
            //           };
            //           if (
            //             element.type_value === 'list' &&
            //             element.list_type_value === 'entity'
            //           ) {
            //             const relationsArray = data[element.name];
            //             if (relationsArray && Array.isArray(relationsArray)) {
            //               relationsArray.forEach((element: any) => {
            //                 newResponse.entity_relations.push(element);
            //               });
            //             }
            //           } else {
            //             if (element.type_value === 'boolean') {
            //               newDet.value = data[element.name] ? true : false;
            //             } else {
            //               newDet.value = `${data[element.name] ?? null}`;
            //             }
            //           }
            //           if (newDet.type_list_value !== 'entity') {
            //             newResponse.entity_detail.push(newDet);
            //           }
            //         }
            //       });
            //     }
            //     resolve(newResponse);
            //   })
            //   .catch((_err: any) => {
            //     resolve(null);
            //   });
          }
        } else {
          resolve(null);
        }
      });
    },
    [actionsInstructions],
  );

  // const generarNumeroReciboFechaTimestampAleatorio = () => {
  //   const fecha = new Date();
  //   const año = fecha
  //     .getFullYear()
  //     .toString()
  //     .slice(-2);
  //   const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  //   const dia = fecha
  //     .getDate()
  //     .toString()
  //     .padStart(2, '0');
  //   const fechaFormateada = `${año}${mes}${dia}`;
  //   const timestampStr = Date.now().toString();
  //   let digitosAleatorios = '';
  //   const indicesAleatorios: any[] = [];
  //   while (indicesAleatorios.length < 6) {
  //     const indice = Math.floor(Math.random() * timestampStr.length);
  //     if (!indicesAleatorios.includes(indice)) {
  //       indicesAleatorios.push(indice);
  //     }
  //   }
  //   indicesAleatorios.sort();
  //   for (const indice of indicesAleatorios) {
  //     digitosAleatorios += timestampStr[indice];
  //   }
  //   return `${fechaFormateada}${digitosAleatorios.padStart(6, '0')}`;
  // };

  const handleSaveEntity = useCallback(() => {
    showYesNoQuestion(
      '',
      'Se realizara el registro de los datos, ¿seguro de querer guardar?',
      'warning',
    ).then(async (val: any) => {
      if (val) {
        setIsSaving(true);
        const newDetail = Object.assign([], entityDetail);
        // agrego un polígono vacío en las parcelas
        // if (module?.idRef === modulesConfig.PRODUCTIVE_MODULE_UUID) {
        //   const newUuid = QUESTION_POLYGON_ID;
        //   const newDet: EntityDetail = {
        //     id: newUuid,
        //     is_representative: false,
        //     name: 'polígono',
        //     type_value: 'geojson',
        //     value: {
        //       geojson: {
        //         type: 'FeatureCollection',
        //         features: [],
        //       },
        //     },
        //   };
        //   newDetail.push(newDet);
        // }
        // // agrego el número de recibo a las compras creadas
        // if (module?.idRef === modulesConfig.PURCHASE_MODULE_UUID) {
        //   const newDet: any = {
        //     name: 'recibo',
        //     value: generarNumeroReciboFechaTimestampAleatorio(),
        //     instruction_id: '5dfbaae4-e06d-4c4c-9eb6-17e139ce34f8',
        //   };
        //   newDetail.push(newDet);
        // }
        const uuidNewEntity = uuidv4();
        const newRelations = Object.assign([], entityRelations);
        const actionDetails: ActionsResponseType | null = await verifyActionsInstructions(
          newDetail,
          uuidNewEntity,
        );
        if (actionDetails) {
          if (actionDetails?.entity_detail.length > 0) {
            actionDetails.entity_detail.forEach((element) =>
              newDetail.push(element),
            );
          }
          if (actionDetails?.entity_relations.length > 0) {
            actionDetails.entity_relations.forEach((element) =>
              newRelations.push(element),
            );
          }
        }
        //agregar este uuid a la relación externa que se esta generando
        //complete external relations
        // let newExternalRelations: EntityExternalRelationsArray[] = [];
        // newExternalRelations = externalEntityRelations.map(
        //   (value: EntityExternalRelationsArray) => {
        //     const newValue: EntityExternalRelationsArray = {
        //       ...value,
        //       relation: {
        //         ...value.relation,
        //         entity_id: uuidNewEntity,
        //         representative_value: getRepresentativeValue(newDetail) ?? '',
        //         created_at: new Date().toString(),
        //       },
        //     };
        //     return newValue;
        //   },
        // );
        //
        const detail = newDetail.map((element: EntityDetailMetadata) => {
          // console.log(element);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { metadata, ...entityDetail } = element;
          entityDetail.display_name =
            element?.metadata?.data_input?.title || element?.name || '';
          return entityDetail;
        });
        const newRow: any = {
          // idRef: uuidNewEntity,
          tenant: localStorage.getItem('tenant_id') ?? '',
          module_name: module?.name ?? '',
          module_id: module?.id,
          entity_type: module?.entity_type,
          location: {},
          module_detail: detail,
          entity_relations: newRelations,
          disabled_at: null,
          updated_at: new Date(),
          created_at: new Date(),
        };
        const register: CoreRegister = {
          form_id: module?.id,
          schema_form_id: module?.schema_id ?? '',
          detail: detail,
          location: null,
          identity_id: newSession.user.id,
          duration: new Date().getTime() - newSession.created_at.getTime(),
        };
        // console.log(newRow);
        console.log('createEntity', newRow);
        FormService.createRegister(register)
          .then((register_resp: any) => {
            if (register_resp) {
              handleSaveSession(register_resp?.id, newRow?.entity_type);
            }

            // setNewSession((session: ModuleSession) => {
            //   return newSession;
            // });

            setIsSaving(false);
            showMessage('', 'Se cargaron los datos correctamente.', 'success');
            beforeRegister && beforeRegister();
          })
          .catch(() => {
            setIsSaving(false);
            showMessage(
              '',
              'Problemas en cargar los datos, vuelva a intentarlo',
              'error',
            );
          });

        // createEntity(newRow)
        //   .then(async (respCreate: any) => {
        //     // console.log(respCreate);
        //     handleSaveEntityLocation(respCreate?.objectId);
        //     //actualizar las entidades externas con las relaciones
        //     newExternalRelations.forEach(
        //       async (element: EntityExternalRelationsArray) => {
        //         await addRelationToEntity(
        //           collectionNames[element.type_to ?? 'OBJECT'],
        //           element,
        //         );
        //       },
        //     );

        //     // si es una compra, creo un movimiento de saldo
        //     if (module?.idRef === modulesConfig.PURCHASE_MODULE_UUID) {
        //       // obtengo el lote
        //       const lot_entity_id = newRow.entity_relations.find(
        //         (value: EntityRelations) =>
        //           value.module_id === modulesConfig.LOT_MODULE_UUID,
        //       )?.entity_id;
        //       if (lot_entity_id) {
        //         // obtengo el lote
        //         const lot_entity = await getAnyEntityById(
        //           collectionNames.OBJECT,
        //           lot_entity_id,
        //         );
        //         if (lot_entity) {
        //           // obtengo el centro de acopio del lote
        //           const gathering_id = lot_entity.entity_relations.find(
        //             (value: EntityRelations) =>
        //               value.module_id === modulesConfig.GATHERING_MODULE_UUID,
        //           )?.entity_id;
        //           if (gathering_id) {
        //             const quantity = !isNaN(+getDetailValue('cantidad', detail))
        //               ? +getDetailValue('cantidad', detail)
        //               : 0;
        //             const price = !isNaN(+getDetailValue('precio', detail))
        //               ? +getDetailValue('precio', detail)
        //               : 0;
        //             const newBalanceMovement: BalanceMovement = {
        //               id: uuidv4(),
        //               gathering_id: gathering_id,
        //               gatherer_id: user?.id,
        //               type: MovementType.PURCHASE,
        //               amount: +(quantity * price).toFixed(2),
        //               reference: newRow.id,
        //               user_id: user?.id,
        //               created_at: new Date(),
        //             };
        //             createMovement(newBalanceMovement);
        //           }
        //         }
        //       }
        //     }
        //     // registro el module session
        //     handleSaveSession(newRow?.idRef, newRow?.entity_type);

        //     // setNewSession((session: ModuleSession) => {
        //     //   return newSession;
        //     // });
        //     setIsSaving(false);

        //     showMessage('', 'Se cargaron los datos correctamente.', 'success');
        //     if (module?.entity_type !== 'COMPLEMENTARY') {
        //       if (module?.idRef === modulesConfig.STORE_MODULE_UUID) {
        //         navigate(`${getListRoute()}`);
        //       } else if (
        //         module?.idRef === modulesConfig.GATHERING_MODULE_UUID ||
        //         module?.idRef === modulesConfig.LOT_MODULE_UUID
        //       ) {
        //         navigate(`${getListRoute()}`);
        //       } else if (module?.idRef === modulesConfig.PRODUCER_MODULE_UUID) {
        //         navigate(`${getListRoute()}`);
        //       } else if (
        //         module?.idRef === modulesConfig.PRODUCTIVE_MODULE_UUID
        //       ) {
        //         navigate(`${getListRoute()}`);
        //       } else {
        //         navigate(`${getListRoute()}`);
        //       }
        //       // if (
        //       //   module?.idRef !== modulesConfig.LOT_MODULE_UUID &&
        //       //   module?.idRef !== modulesConfig.GATHERING_MODULE_UUID
        //       // ) {
        //       //   navigate(`${routes.entities}#${module?.entity_type === 'OBJECT' ? '2' : '1'}`);
        //       // } else {
        //       //   navigate(`${routes.gathering_collector_center}`);
        //       // }
        //     } else {
        //       if (module?.idRef === modulesConfig.PURCHASE_MODULE_UUID) {
        //         navigate(`${getListRoute()}`);
        //       } else {
        //         navigate(`${getListRoute()}`);
        //       }
        //     }
        //   })
        //   .catch(() => {
        //     setIsSaving(false);
        //     showMessage(
        //       '',
        //       'Problemas en cargar los datos, vuelva a intentarlo',
        //       'error',
        //     );
        //   });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityDetail, module, entityRelations, newSession]);

  const getBackRefToInstructions = useCallback(
    (_instructions: Instruction[], _idInstruction: string): string => {
      // const instruction = instructions.find(
      //   (value: Instruction) => value.id === idInstruction,
      // );
      let str = 'Relación con entidad';
      // if (
      //   instruction &&
      //   instruction.schema_input &&
      //   instruction.schema_input?.length > 0
      // ) {
      //   str = instruction.schema_input[3].value ?? '';
      // }
      return str;
    },
    [],
  );

  // const validateEntityUniqueField = useCallback(
  //   async (arrayToEvaluate: any[]) => {
  //     // junto para mandar todas las peticiones a la api
  //     const fieldsToValidate = arrayToEvaluate.filter(Boolean);
  //     const validationPromises = fieldsToValidate.map((field) =>
  //       FormService.validateUniqueField({
  //         field_name: field.name,
  //         ...field,
  //       }),
  //     );
  //     const responses = await Promise.allSettled(validationPromises);
  //     if (responses && Array.isArray(responses) && responses.length > 0) {
  //       responses.forEach((element: any) => {
  //         const { module_detail } = element;
  //         if (module_detail) {
  //           newErrors = {
  //             ...newErrors,
  //             [module_detail.name]: 'El valor ya se encuentra registrado',
  //           };
  //           newTouched = { ...newTouched, [module_detail.name]: true };
  //         }
  //       });
  //     }
  //   },
  //   [],
  // );

  const handleValidateFields = useCallback(async () => {
    setIsSaving(true);
    const newDetail = Object.assign([], entityDetail);
    let newErrors = {};
    let newTouched = {};

    //OPTIONAL VALIDATION
    newDetail.forEach((detail: EntityDetail) => {
      // verifico si el campo esta visible
      if (
        !detail.is_optional &&
        !detail.value &&
        visibleQuestions.includes(detail.instruction_id ?? '')
      ) {
        console.log(detail);
        newErrors = { ...newErrors, [detail.name]: 'El campo es obligatorio' };
        newTouched = { ...newTouched, [detail.name]: true };
      }
    });
    //UNIQUE VALIDATION
    const arrayToEvaluate = newDetail.map((detail: EntityDetailMetadata) => {
      if (typeof detail.value === 'string' && detail.is_unique === true) {
        console.log(detail);
        return {
          name: detail.name,
          value: detail.value,
          form_id: module.id ?? '',
        };
      }
      return null;
    });
    if (arrayToEvaluate.length > 0) {
      // console.log('validateEntityUniqueField', arrayToEvaluate);
      const fieldsToValidate = arrayToEvaluate.filter(Boolean);
      for (const field of fieldsToValidate) {
        if (field) {
          const validateResponse = await FormService.validateUniqueField({
            field_name: field.name,
            entity_name: module.entity_name,
            entity_field: {
              [field.name]: field.value,
            },
            ...field,
          });

          if (validateResponse?.exist) {
            newErrors = {
              ...newErrors,
              [field.name]: 'El valor ya se encuentra registrado',
            };
            newTouched = { ...newTouched, [field.name]: true };
          }
        }
      }
      // const validationPromises = fieldsToValidate.map((field: any) =>
      // );
      // const responses = await Promise.allSettled(validationPromises);
      // if (responses && Array.isArray(responses) && responses.length > 0) {
      //   responses.forEach((element: any) => {
      //     const { module_detail } = element;
      //     if (module_detail) {
      //       newErrors = {
      //         ...newErrors,
      //         [module_detail.name]: 'El valor ya se encuentra registrado',
      //       };
      //       newTouched = { ...newTouched, [module_detail.name]: true };
      //     }
      //   });
      // }
      // const response = await validateEntityUniqueField(arrayToEvaluate);
      // if (response && Array.isArray(response) && response.length > 0) {
      //   response.forEach((element: any) => {
      //     const { module_detail } = element;
      //     if (module_detail) {
      //       newErrors = {
      //         ...newErrors,
      //         [module_detail.name]: 'El valor ya se encuentra registrado',
      //       };
      //       newTouched = { ...newTouched, [module_detail.name]: true };
      //     }
      //   });
      // }
    }
    console.log(entityDetail);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(newTouched);
      setIsSaving(false);
    } else {
      setErrors({});
      setTouched({});
      setIsSaving(false);
      handleSaveEntity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityDetail, visibleQuestions, module]);

  const mergeUniqueById = (current: any[], incoming: any[], key = 'id') => {
    const map = new Map<string, any>();

    current.forEach((item) => {
      map.set(item[key], item);
    });

    incoming.forEach((item) => {
      map.set(item[key], item); // sobrescribe si existe
    });

    return Array.from(map.values());
  };

  const loadMoreEntityValues = async ({
    idSelected,
    instruction_id,
    search = '',
    page = 1,
    append = true,
  }: any) => {
    // console.log(idSelected, instruction_id, search, page, append);
    setEntityValuesArray((prev) =>
      prev.map((e) =>
        e.instruction_id === instruction_id
          ? { ...e, loading: true, search }
          : e,
      ),
    );

    const res = await FormService.getListEntitiesData(
      idSelected,
      page,
      10,
      'name',
      'asc',
      search,
      '',
      '',
    );
    //   {
    //   params: { instruction_id, search, page },
    // });

    setEntityValuesArray((prev) =>
      prev.map((e) =>
        e.instruction_id === instruction_id
          ? {
              ...e,
              values: append
                ? mergeUniqueById(e.values, res.data.values)
                : res.data.values,
              page: res.data.page,
              per_page: res.data.per_page,
              total: res.data.total,
              loading: false,
            }
          : e,
      ),
    );
  };

  const handleEntityValue = useCallback(
    (element1: any) => {
      console.log(element1);
      const elementValue = element1?.schema_input[2]?.value;
      // const isFarm = element?.id === questionFarmId;
      let arrToEvaluate = [];
      if (typeof elementValue === 'string') {
        arrToEvaluate = [`${elementValue}`];
      }
      if (Array.isArray(elementValue)) {
        arrToEvaluate = elementValue;
      }
      if (arrToEvaluate.length > 0) {
        // console.log(arrToEvaluate);
        arrToEvaluate.forEach((idSelected: string) => {
          const filter: any = undefined;
          let extraFilter: any = undefined;
          // if (idSelected === modulesConfig.LOT_MODULE_UUID) {
          //   extraFilter = {
          //     entity_relations: {
          //       $not: {
          //         $elemMatch: {
          //           module_id: modulesConfig.STORE_MODULE_UUID,
          //         },
          //       },
          //     },
          //   };
          // }
          console.log('getEntitiesByModuleId', idSelected, filter, extraFilter);
          FormService.getListEntitiesData(
            idSelected,
            1,
            100,
            'name',
            'asc',
            '',
            '',
            '',
          ).then((resp: any) => {
            if (resp) {
              const listValues: Option[] = [];
              // const { entities, entity_type } = resp[0];
              const { items, page, per_page, total } = resp;
              // console.log(entities);
              Array.isArray(items) &&
                items.forEach((element: any) => {
                  // console.log(element);
                  const option: Option = {
                    id: element.id,
                    display_name: element.name,
                    description: element.name,
                    module_id: idSelected,
                    module_name: idSelected,
                  };

                  listValues.push(option);
                });
              // console.log(listValues);
              const filterStr = element1?.metadata?.data_input?.filter ?? '';
              if (filterStr && filterStr !== '') {
                // filtro: departments.country_id={{farmers.country_id}}
                // obtengo lo que esta entre los corchetes
                const filterField = filterStr.match(/{{(.*?)}}/g);
                // console.log(filterField);
                if (filterField) {
                  const filterFieldName = filterField[0]
                    .replace('{{', '')
                    .replace('}}', '')
                    .split('.')[1];
                  // const obj={
                  //   filtered_field: element1?.schema_gather?.name,
                  // }
                  setFilteredFields((prev: any) => {
                    return {
                      ...prev,
                      [`${filterFieldName}`]: element1?.id,
                    };
                  });
                }
              }
              setEntityValuesArray((prev: entityValues[]) => {
                const obj: entityValues = {
                  instruction_id: element1.id,
                  values: listValues,
                  page: page,
                  per_page: per_page,
                  total: total,
                  filter: filterStr,
                  loading: false,
                  search: '',
                  idSelected,
                };
                return [...prev, obj];
              });
            }
          });

          // getEntitiesByModuleId(idSelected, filter, extraFilter).then(
          //   (resp: any) => {
          //     // console.log(resp);
          //     if (resp && resp.length > 0) {
          //       const listValues: Option[] = [];
          //       const { entities, entity_type } = resp[0];
          //       // console.log(entities);
          //       Array.isArray(entities) &&
          //         entities.forEach((element: Entity) => {
          //           // console.log(element);
          //           const option: Option = {
          //             id: element.idRef,
          //             display_name: getRepresentativeValue(
          //               element.module_detail,
          //             ),
          //             description: entity_type,
          //             module_id: element.module_id,
          //             module_name: element.module_name ?? '',
          //           };
          //           if (isFarm) {
          //             option.deforest_value = getDeforestIndicatorValue(
          //               element.module_detail,
          //             );
          //           }
          //           if (
          //             element.module_id === modulesConfig.PRODUCTIVE_MODULE_UUID
          //           ) {
          //             // obtengo la relación con el productor
          //             const producerRel = element.entity_relations.find(
          //               (value: EntityRelations) =>
          //                 value.module_id ===
          //                 modulesConfig.PRODUCER_MODULE_UUID,
          //             );
          //             if (producerRel) {
          //               option.owner = producerRel.entity_id ?? '';
          //             }
          //           }
          //           if (element.module_id === PLANT_MODULE_ID) {
          //             // obtengo la relación con la parcela
          //             const farmRel = element.entity_relations.find(
          //               (value: EntityRelations) =>
          //                 value.module_id ===
          //                 modulesConfig.PRODUCTIVE_MODULE_UUID,
          //             );
          //             if (farmRel) {
          //               option.owner = farmRel.entity_id ?? '';
          //             }
          //           }
          //           if (element.module_id === COB_MODULE_ID) {
          //             // obtengo la relación con la planta
          //             const plantRel = element.entity_relations.find(
          //               (value: EntityRelations) =>
          //                 value.module_id === PLANT_MODULE_ID,
          //             );
          //             if (plantRel) {
          //               option.owner = plantRel.entity_id ?? '';
          //             }
          //           }
          //           if (element.module_id === FLOWER_MODULE_ID) {
          //             // obtengo la relación flor con la planta
          //             const plantRel = element.entity_relations.find(
          //               (value: EntityRelations) =>
          //                 value.module_id === PLANT_MODULE_ID,
          //             );
          //             if (plantRel) {
          //               // console.log(plantRel);
          //               option.owner = plantRel.entity_id ?? '';
          //             }
          //           }
          //           listValues.push(option);
          //         });
          //       // console.log(listValues);

          //       setEntityValuesArray((prev: entityValues[]) => {
          //         const obj: entityValues = {
          //           instruction_id: element.id,
          //           values: listValues,
          //         };
          //         return [...prev, obj];
          //       });
          //     }
          //   },
          // );
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // const renderItemFarm = useCallback((item: any) => {
  //   return (
  //     <React.Fragment key={item.id}>
  //       {item['display_name']}{' '}
  //       {item.deforest_value &&
  //         !isNaN(item.deforest_value.natural_forest_coverage) &&
  //         !isNaN(item.deforest_value.natural_forest_lost) && (
  //           <RenderGFWStatus
  //             coverage_value={item.deforest_value.natural_forest_coverage}
  //             loss_value={item.deforest_value.natural_forest_lost}
  //             complete={false}
  //             textWithColor
  //           />
  //         )}
  //     </React.Fragment>
  //   );
  // }, []);

  function extraerPatrones(texto: string): string[] {
    const regex = /\{\{\s*(.*?)\s*\}\}/g;
    const coincidencias: string[] = [];
    let match;

    while ((match = regex.exec(texto)) !== null) {
      coincidencias.push(match[1]);
    }

    return coincidencias;
  }
  // const [instructions, setInstructions] = useState<any[]>([]);
  const [instructionStart, setInstructionStart] = useState<string>('');

  // const loadModuleSchema = async (schema_id: string) => {
  //   console.log('getModuleSchemaById', schema_id);
  //   const resp: any = await FormService.getSchemaById(schema_id);
  //   const { instructions, instruction_start } = resp?.schema;
  //   setInstructionStart(instruction_start);

  //   console.log(resp);
  // };

  useEffect(() => {
    // console.log(module);
    if (module?.id) {
      setIsLoading(true);
      // loadModuleSchema(module?.schema_id ?? '');
      // setIsLoading(false);
      FormService.getById(module?.id ?? '')
        .then((resp: any) => {
          // console.log(resp);
          const { instructions, instruction_start } = resp?.schema;
          // console.log(instructions);
          // setInstructions(instructions);
          setInstructionStart(instruction_start);
          if (
            instructions &&
            Array.isArray(instructions) &&
            instructions.length > 0
          ) {
            for (let i = 0; i < instructions.length; i++) {
              const element = instructions[i];
              //has on_action
              const onAction = element?.config?.tool?.on_action;
              if (onAction) {
                const newAction: actionsTypes = {
                  instruction_id: element?.id,
                  on_action: onAction,
                  schema_variables: element.schema_variables,
                  schema_input: element.schema_input,
                };
                // api_media_s3
                //   .new_get(
                //     onAction.location,
                //     // {},
                //     {
                //       ApiKey: onAction.api_key,
                //       tenant: localStorage.getItem('tenant_id'),
                //       module_session_id: element.id,
                //     },
                //   )
                //   .then((resp: any) => {
                //     // console.log(resp);
                //     const { data } = resp?.data;
                //     if (data) {
                //       const obj: dataVars = {
                //         name: element.schema_variables[0].name,
                //         value: data,
                //       };
                //       setVarsActionsInstructions((prev: dataVars[]) => [
                //         ...prev,
                //         obj,
                //       ]);
                //     }
                //   });
                setActionsInstructions((prev: actionsTypes[]) => [
                  ...prev,
                  newAction,
                ]);
              }
            }
            const arrDataFields: SchemaGatherMetadata[] = instructions
              .filter((instruction: any) => instruction.schema_gather)
              .map((element: any) => {
                //has entity
                if (element?.schema_gather?.type_value === 'entity') {
                  handleEntityValue(element);
                }
                return {
                  ...element?.schema_gather,
                  schema_conditions: element.schema_conditions,
                  instruction_id: element.id,
                  metadata: element.metadata,
                };
              });
            //create new detail
            const newRelations: EntityRelations[] = [];
            const newExternalRelationsArray: EntityExternalRelationsArray[] = [];
            // let producerType: any = null;
            // let farmType: any = null;
            // // agrayu
            // let plantType: any = null;
            // let cobType: any = null;
            // let flowerType: any = null;

            const newDetail: any[] = arrDataFields.map(
              (element: SchemaGatherMetadata) => {
                const newDet: any = {
                  id: element.id, //
                  name: element.name,
                  schema_conditions: element.schema_conditions,
                  value: null,
                  type_media: element.type_media ?? null,
                  is_representative: element.is_representative,
                  type_value: element.type_value,
                  type_list_value: element.type_list_value ?? null,
                  order: element.is_visual_table ?? 0,
                  is_unique: element.is_unique,
                  is_optional: element.is_optional,
                  instruction_id: element.instruction_id,
                  option: element.option,
                  metadata: element.metadata,
                };
                if (element.type_value === 'entity') {
                  // if (!farmType) {
                  //   farmType = element.metadata?.data_input?.entity_type?.find(
                  //     (value: any) =>
                  //       value.id === modulesConfig.PRODUCTIVE_MODULE_UUID,
                  //   );
                  //   setQuestionFarmId(element.instruction_id ?? '');
                  // }
                  // if (!producerType) {
                  //   producerType = element.metadata?.data_input?.entity_type?.find(
                  //     (value: any) =>
                  //       value.id === modulesConfig.PRODUCER_MODULE_UUID,
                  //   );
                  // }
                  // if (!plantType) {
                  //   plantType = element.metadata?.data_input?.entity_type?.find(
                  //     (value: any) => value.id === PLANT_MODULE_ID,
                  //   );
                  //   setQuestionPlantId(element.instruction_id ?? '');
                  // }
                  // if (!cobType) {
                  //   cobType = element.metadata?.data_input?.entity_type?.find(
                  //     (value: any) => value.id === COB_MODULE_ID,
                  //   );
                  //   setQuestionCobId(element.instruction_id ?? '');
                  // }
                  // if (!flowerType) {
                  //   flowerType = element.metadata?.data_input?.entity_type?.find(
                  //     (value: any) => value.id === FLOWER_MODULE_ID,
                  //   );
                  //   setQuestionFlowerId(element.instruction_id ?? '');
                  // }
                  const newRel: EntityRelations = {
                    entity_id: '',
                    backref: getBackRefToInstructions(
                      instructions,
                      element.instruction_id ?? '',
                    ),
                    module_name: '',
                    module_id: '',
                    entity_type: '',
                    var_name: '',
                    detail_id: element.id,
                  };
                  const externalRelation: EntityExternalRelationsArray = {
                    detail_id: element.id,
                    id_to: '',
                    type_to: '',
                    relation: {
                      entity_id: '',
                      backref: '',
                      module_name: module?.name,
                      module_id: module?.id,
                      entity_type: module?.entity_type,
                      var_name: 'Es propietario de',
                      detail_id: element.id,
                      representative_value: '',
                      created_at: '',
                    },
                  };
                  newExternalRelationsArray.push(externalRelation);
                  newRelations.push(newRel);
                }
                return newDet;
              },
            );

            // if (farmType && producerType) {
            //   setActiveFarmFilter(true);
            // }
            // if (plantType && farmType) {
            //   setActivePlantFilter(true);
            // }
            // if (cobType && plantType) {
            //   setActiveCobFilter(true);
            // }
            // if (flowerType && plantType) {
            //   setActiveFlowerFilter(true);
            // }
            // console.log(newDetail);
            // filtro los campos que no son geojson
            // const newDetailFiltered =
            // newDetail.filter((element: any) => !EXCLUDES_TYPES.includes(element.type_value));

            setEntityRelations(newRelations);
            // setExternalEntityRelations(newExternalRelationsArray);
            // console.log(newDetailFiltered);
            // console.log(newDetailFiltered);
            setEntityDetail(newDetail);
            setIsLoading(false);
          } else {
            showMessage(
              '',
              'El módulo debe tener al menos una pregunta configurada, configure las preguntas del módulo y vuelva a intentarlo.',
              'warning',
            );
            setIsLoading(false);
            handleCancelRegisterView();
          }
        })
        .catch((error) => {
          console.log(error);
          showMessage('', 'No se pudo obtener los datos del módulo', 'error');
          setIsLoading(false);
          navigate(getListRoute());
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, navigate]);

  //efecto que asigna opciones al select
  useEffect(() => {
    if (varsActionsInstructions.length > 0) {
      setEntityDetail((prev: EntityDetailMetadata[]) =>
        prev.map((element: EntityDetailMetadata) => {
          if (
            element.metadata?.data_input?.type === 'options' &&
            typeof element.metadata?.data_input?.options === 'string'
          ) {
            const varData = extraerPatrones(
              element.metadata?.data_input?.options,
            )[0];
            if (varData) {
              const newOptions = varsActionsInstructions.find(
                (value: dataVars) => value.name === varData,
              );
              if (newOptions) {
                return { ...element, option: newOptions.value };
              }
            }
          }
          return element;
        }),
      );
    }
    // console.log(entityDetail);
    // console.log(varsActionsInstructions);
  }, [varsActionsInstructions]);

  // useEffect(() => {
  //   console.log(instructions);
  //   // return () => {

  //   // };
  // }, [instructions]);
  // useEffect(() => {
  //   console.log(entityDetail);
  // }, [entityDetail]);

  // new set de preguntas visibles

  function renderChildren(node: any, answer: string, level: number) {
    if (!node.schema_conditions) return null;

    const rendered = [];

    // 1. Primero by_var (condicionales)
    for (const cond of node.schema_conditions) {
      if (
        cond.type_condition === 'by_var' &&
        cond?.validators &&
        typeof answer === 'string'
      ) {
        const validator = cond?.validators[0];
        if (
          // cond.type_condition === 'by_var' &&
          validator.validator_name === 'equal' &&
          validator.value.toLowerCase() === answer.toLowerCase() &&
          cond.next_instruction_id
        ) {
          rendered.push(renderNode(cond.next_instruction_id, level));
        }
      }
    }

    // 2. Luego by_success (flujo normal)
    for (const cond of node.schema_conditions) {
      if (cond.type_condition === 'by_success' && cond.next_instruction_id) {
        rendered.push(renderNode(cond.next_instruction_id, level));
      }
    }

    return rendered;
  }

  function renderNode(nodeId: string, level = 0): React.ReactNode {
    // const node = idToNode.get(nodeId);
    const node = entityDetail.find((n) => n.instruction_id === nodeId);
    if (!node) return null;
    // console.log(node);
    const title =
      node?.metadata?.data_input?.title || node?.name || '(sin título)';

    // agrego el nodo a la lista de visibles
    if (!visibleQuestions.includes(nodeId)) {
      setVisibleQuestions((prev: string[]) => [...prev, nodeId]);
    }
    // console.log(entityValuesArray);
    // const currentAnswer = answers[node.id] || '';
    let arrFiltered = entityValuesArray;
    // Filtro las parcelas por productor
    // if (node?.instruction_id === questionFarmId && producerSelected) {
    //   arrFiltered = entityValuesArray.map((value: entityValues) => {
    //     if (value.instruction_id === questionFarmId) {
    //       return {
    //         ...value,
    //         values: value.values.filter(
    //           (value: Option) => value.owner === producerSelected.id,
    //         ),
    //       };
    //     }
    //     return value;
    //   });
    // }

    // // filtro para plantas por parcela
    // if (node?.instruction_id === questionPlantId && farmSelected) {
    //   arrFiltered = entityValuesArray.map((value: entityValues) => {
    //     if (value.instruction_id === questionPlantId) {
    //       return {
    //         ...value,
    //         values: value.values.filter(
    //           (value: Option) => value.owner === farmSelected.id,
    //         ),
    //       };
    //     }
    //     return value;
    //   });
    // }
    // // filtro para mazorcas por planta
    // if (node?.instruction_id === questionCobId && plantSelected) {
    //   arrFiltered = entityValuesArray.map((value: entityValues) => {
    //     if (value.instruction_id === questionCobId) {
    //       return {
    //         ...value,
    //         values: value.values.filter(
    //           (value: Option) => value.owner === plantSelected.id,
    //         ),
    //       };
    //     }
    //     return value;
    //   });
    // }
    // // filtro para flores por planta
    // if (node?.instruction_id === questionFlowerId && plantSelected) {
    //   // console.log(element);
    //   // console.log(entityValuesArray);
    //   arrFiltered = entityValuesArray.map((value: entityValues) => {
    //     if (value.instruction_id === questionFlowerId) {
    //       return {
    //         ...value,
    //         values: value.values.filter(
    //           (value: Option) => value.owner === plantSelected.id,
    //         ),
    //       };
    //     }
    //     return value;
    //   });
    // }

    // render del nodo actual

    // console.log(errors);

    return (
      <>
        <Grid
          // xs={12}
          // sm={12}
          // md={6}
          size={{ xs: 12, sm: 12, md: 6 }}
          key={`element_${node.id}`}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            sx={{
              color: themes.palette.primary.main,
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            {title ?? ''}
            {/* {capitalizeAllWords(translateText(title ?? ''))} */}
          </Typography>
          <FieldEntity
            element={node}
            errors={errors}
            touched={touched}
            entityDetail={entityDetail}
            isEdit={false}
            itemValue={node.name === 'acopiador' ? 'id' : undefined}
            updateEntityDetail={updateEntityDetail}
            loadMoreEntityValues={loadMoreEntityValues}
            entityValuesArray={arrFiltered}
            updateEntityFieldValue={updateEntityFieldValue}
            // renderOption={
            //   node?.instruction_id === questionFarmId
            //     ? renderItemFarm
            //     : undefined
            // }
            // producerSelected={producerSelected}
          />
        </Grid>

        {/* hijos que dependen de este nodo */}
        {renderChildren(node, node.value, level + 1)}
      </>
    );
  }

  useEffect(() => {
    console.log(entityValuesArray);
  }, [entityValuesArray]);
  useEffect(() => {
    console.log(filteredFields);
  }, [filteredFields]);

  useEffect(() => {
    setNewSession((session: ModuleSession) => {
      const newSession: ModuleSession = {
        ...session,
        idRef: uuidv4(),
        tenant: localStorage.getItem('tenant_id') ?? '',
        instruction_now_id: '',
        module: {
          id: module?.id ?? '',
          schema_id: module?.schema_id ?? '',
        },
        user: {
          // id: '',
          id: user?.id ?? '',
          channel: 'identi connect',
          identifier: '',
        },
        // module_schema_id: module?.schema_id ?? '',
        // user_id: user?.id,
        created_at: new Date(),
        updated_at: new Date(),
      };
      // console.log(newSession);
      return newSession;
    });
    // }, [module?.idRef, module?.schema_id, user?.eid, user?.id]);
  }, [module?.id, module?.schema_id]);

  return (
    <Grid
      container
      spacing={isModal ? 0 : 5}
      mt={isModal ? 0 : 5}
      ml={isModal ? 0 : 5}
      display={'flex'}
      flexDirection={'column'}
    >
      <Grid pt={0}>
        <Card sx={{ padding: 2, width: '100%' }}>
          <Typography variant="h5" color={'primary.main'}>
            {module.name ?? ''}
            {/* {translateText(module.name ?? '')} */}
          </Typography>
        </Card>
      </Grid>

      <Grid sx={{ paddingTop: isModal ? 0 : 2 }}>
        {isLoading ? (
          <Box width={'100%'} marginTop={5}>
            <LinearProgress loading={true} />
          </Box>
        ) : (
          <>
            <Card sx={{ padding: 2, width: '100%' }}>
              <Grid
                container
                sx={{ marginTop: 1, padding: 1 }}
                spacing={2}
                maxHeight={'57vh'}
                className="scrollBarClass"
              >
                {renderNode(instructionStart)}
                {/* {entityDetail.map((element: EntityDetail, index: number) => {
                  let arrFiltered = entityValuesArray;
                  // Filtro las parcelas por productor
                  if (element?.instruction_id === questionFarmId && producerSelected) {
                    arrFiltered = entityValuesArray.map((value: entityValues) => {
                      if (value.instruction_id === questionFarmId) {
                        return {
                          ...value,
                          values: value.values.filter((value: Option) => value.owner === producerSelected.id)
                        };
                      }
                      return value;
                    });
                  }
                  if (element.type_value !== 'geojson') {
                    return (
                      <Grid item xs={12} sm={12} md={6} key={`element_${element.id}_${index}`}>
                        <Typography
                          sx={{
                            color: themes.palette.primary.main,
                            fontWeight: 600,
                            fontSize: '14px'
                          }}
                        >
                          {index + 1}. {capitalizeAllWords(translateText(element.name ?? ''))}
                        </Typography>
                        <FieldEntity
                          element={element}
                          errors={errors}
                          touched={touched}
                          entityDetail={entityDetail}
                          isEdit={false}
                          itemValue={element.name === 'acopiador' ? 'id' : undefined}
                          updateEntityDetail={updateEntityDetail}
                          entityValuesArray={arrFiltered}
                          updateEntityFieldValue={updateEntityFieldValue}
                          renderOption={element?.instruction_id === questionFarmId ? renderItemFarm : undefined}
                          // producerSelected={producerSelected}
                        />
                      </Grid>
                    );
                  }
                  return null;
                })} */}
                {/* {entityDetail.length > 0 &&
                  (module?.idRef === modulesConfig.PRODUCTIVE_MODULE_UUID ||
                    module?.idRef === modulesConfig.PRODUCER_MODULE_UUID) && (
                    <LocationEntity
                      onChangeLocation={onChangeLocation}
                      // index={entityDetail.length}
                    />
                  )} */}
              </Grid>
              {/* <Grid
                container
                sx={{ marginTop: 1, padding: 1 }}
                spacing={2}
                maxHeight={'57vh'}
                className="scrollBarClass"
              >
                {entityDetail.map((element: EntityDetail, index: number) => {
                  let arrFiltered = entityValuesArray;
                  // Filtro las parcelas por productor
                  if (element?.instruction_id === questionFarmId && producerSelected) {
                    arrFiltered = entityValuesArray.map((value: entityValues) => {
                      if (value.instruction_id === questionFarmId) {
                        return {
                          ...value,
                          values: value.values.filter((value: Option) => value.owner === producerSelected.id)
                        };
                      }
                      return value;
                    });
                  }
                  // filtro para plantas por parcela
                  if (element?.instruction_id === questionPlantId && farmSelected) {
                    arrFiltered = entityValuesArray.map((value: entityValues) => {
                      if (value.instruction_id === questionPlantId) {
                        return {
                          ...value,
                          values: value.values.filter((value: Option) => value.owner === farmSelected.id)
                        };
                      }
                      return value;
                    });
                  }
                  // filtro para mazorcas por planta
                  if (element?.instruction_id === questionCobId && plantSelected) {
                    arrFiltered = entityValuesArray.map((value: entityValues) => {
                      if (value.instruction_id === questionCobId) {
                        return {
                          ...value,
                          values: value.values.filter((value: Option) => value.owner === plantSelected.id)
                        };
                      }
                      return value;
                    });
                  }
                  // filtro para flores por planta
                  if (element?.instruction_id === questionFlowerId && plantSelected) {
                    // console.log(element);
                    // console.log(entityValuesArray);
                    arrFiltered = entityValuesArray.map((value: entityValues) => {
                      if (value.instruction_id === questionFlowerId) {
                        return {
                          ...value,
                          values: value.values.filter((value: Option) => value.owner === plantSelected.id)
                        };
                      }
                      return value;
                    });
                  }

                  if (element.type_value !== 'geojson') {
                    return (
                      <Grid item xs={12} sm={12} md={6} key={`element_${element.id}_${index}`}>
                        <Typography
                          sx={{
                            color: themes.palette.primary.main,
                            fontWeight: 600,
                            fontSize: '14px'
                          }}
                        >
                          {index + 1}. {capitalizeAllWords(translateText(element.name ?? ''))}
                        </Typography>
                        <FieldEntity
                          element={element}
                          errors={errors}
                          touched={touched}
                          entityDetail={entityDetail}
                          isEdit={false}
                          itemValue={element.name === 'acopiador' ? 'id' : undefined}
                          updateEntityDetail={updateEntityDetail}
                          entityValuesArray={arrFiltered}
                          updateEntityFieldValue={updateEntityFieldValue}
                          renderOption={element?.instruction_id === questionFarmId ? renderItemFarm : undefined}
                          // producerSelected={producerSelected}
                        />
                      </Grid>
                    );
                  }
                  return null;
                })}
                {entityDetail.length > 0 &&
                  (module?.idRef === modulesConfig.PRODUCTIVE_MODULE_UUID ||
                    module?.idRef === modulesConfig.PRODUCER_MODULE_UUID) && (
                    <LocationEntity onChangeLocation={onChangeLocation} index={entityDetail.length} />
                  )}
              </Grid>
                  ))}
              </Grid> */}
              <Grid
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '20px',
                }}
              >
                <Button
                  variant="contained"
                  disabled={isSaving}
                  onClick={handleCancelRegisterView}
                  text="Cancelar"
                  color="error"
                />

                {/* <Button variant="contained" onClick={handleSaveEntity}> */}
                <Button
                  variant="contained"
                  isLoading={isSaving}
                  disabled={isSaving || Object.keys(errors).length > 0}
                  onClick={handleValidateFields}
                  text={'Registrar'}
                />
              </Grid>
            </Card>
          </>
        )}
      </Grid>

      {/* <Grid item sx={{ paddingTop: 2 }}>
        <RegisterConditional formSteps={instructions} instructionStart={instructionStart} />
      </Grid> */}
      {/* <Grid item sx={{ paddingTop: 2 }}>
        <DinamicForm tree={instructions} instructionStart={instructionStart} />
      </Grid> */}
    </Grid>
  );
};

export default React.memo(RegisterModuleComponent);
