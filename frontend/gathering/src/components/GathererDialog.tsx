import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
} from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import Autocomplete from '@ui/components/atoms/Autocomplete/Autocomplete';
// import { EntityExternalRelationsArray, EntityRelations } from '~/models/entities';
// import { schemaNamesEntities } from '~/atlas';
// import useEntity from '~/atlas/entities';
import { showMessage, showYesNoQuestion } from '@ui/utils/Messages';
import { MODULE_ACTOR_DISPLAY_NAME, MODULE_ENTITY_DISPLAY_NAME } from '../..';
import { GatherersService } from '../services/gatherers';
// import { collectionNames } from '~/atlas/modules';

type GathererDialogProps = {
  openDialog: boolean;
  rowSelected: any;
  handleCloseDialog: (isRefresh?: boolean) => void;
  agents: any[];
};

const GathererDialog: React.FC<GathererDialogProps> = (
  props: GathererDialogProps,
) => {
  const { openDialog, agents, handleCloseDialog, rowSelected } = props;
  // const { addRelationToEntity } = useEntity(schemaNamesEntities['OBJECT']);
  const [selectedId, setSelectedId] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const handleAssign = useCallback(() => {
    console.log(selectedId);
    console.log(rowSelected);
    if (selectedId && rowSelected) {
      // validar que no exista en las relaciones
      // const relations = rowSelected?.relations;
      // if (relations && Array.isArray(relations) && relations.length > 0) {
      //   const relation = relations.find(
      //     (relation) => relation.entity_id === selectedId,
      //   );
      //   if (relation) {
      //     showMessage(
      //       '',
      //       `El ${MODULE_ACTOR_DISPLAY_NAME} ya está vinculado a este ${MODULE_ENTITY_DISPLAY_NAME}`,
      //       'warning',
      //     );
      //     return;
      //   }
      // }

      showYesNoQuestion(
        `¿Seguro de querer asignar este ${MODULE_ACTOR_DISPLAY_NAME}?`,
        'Una vez asignado no se podrá desasignar.',
        'warning',
      ).then(async (val: any) => {
        if (val) {
          setLoading(true);

          // creo la relación de acopiador
          // const newRelation: any = {
          //   entity_id: selectedId,
          //   backref: 'Esta vinculado a',
          //   module_name: 'Acopiador',
          //   entity_type: 'Collection_Users',
          //   var_name: '',
          //   detail_id: '',
          //   representative_value: `${agent.first_name} ${agent.last_name}`,
          //   created_at: new Date().toString(),
          // };
          // const newExternalRelation: any = {
          //   detail_id: '',
          //   id_to: rowSelected?.idRef,
          //   type_to: 'Collection_Users',
          //   relation: newRelation,
          // };
          // console.log(newExternalRelation);
          GatherersService.assignGathererToGatheringCenter(
            selectedId,
            rowSelected?.id,
          )
            .then((resp: any) => {
              console.log(resp);
              if (resp) {
                showMessage(
                  '',
                  `El ${MODULE_ACTOR_DISPLAY_NAME} ahora es parte de este centro de acopio`,
                  'success',
                );
                handleCloseDialog(true);
              }
            })
            .catch((_err: any) => {
              // valido error 400
              if (_err.response.status === 400) {
                showMessage(
                  '',
                  `El ${MODULE_ACTOR_DISPLAY_NAME} ya esta asignado a este centro de acopio`,
                  'error',
                );
              } else {
                showMessage(
                  '',
                  `No se ha podido asignar el ${MODULE_ACTOR_DISPLAY_NAME} al ${MODULE_ENTITY_DISPLAY_NAME}, intente nuevamente.`,
                  'error',
                );
              }
            })
            .finally(() => {
              setLoading(false);
            });
          // addRelationToEntity(collectionNames['OBJECT'], newExternalRelation)
          //   .then(() => {
          //     showMessage('', 'El acopiador ahora es parte de este centro de acopio', 'success');
          //   })
          //   .catch(() => {
          //     showMessage(
          //       '',
          //       'Problemas al asignar el acopiador al centro de acopio, inténtelo nuevamente.',
          //       'error'
          //     );
          //   })
          //   .finally(() => {
          //     setLoading(false);
          //     handleCloseDialog(true);
          //   });
        }
      });
      // console.log('handleAssign', selectedId);
    } else {
      showMessage(
        '',
        `Debes seleccionar un ${MODULE_ACTOR_DISPLAY_NAME}`,
        'warning',
      );
    }
  }, [agents, rowSelected, selectedId]);

  //   const handleOpen = () => {
  //     setOpen(true);
  //     (async () => {
  //       setLoading(true);
  //       //   await sleep(1e3); // For demo purposes.
  //       setLoading(false);

  //       setOptions([]);
  //     })();
  //   };

  //   const handleClose = () => {
  //     setOpen(false);
  //     // setOptions([]);
  //   };

  useEffect(() => {
    console.log(selectedId);
    return () => {};
  }, [selectedId]);

  return (
    <Dialog
      open={openDialog}
      onClose={() => handleCloseDialog()}
      maxWidth={'xs'}
      fullWidth
    >
      <DialogTitle>Asignar {MODULE_ACTOR_DISPLAY_NAME}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Selecciona un {MODULE_ACTOR_DISPLAY_NAME}
        </DialogContentText>
        <FormControl fullWidth sx={{ marginTop: 1 }}>
          <Autocomplete
            id={'agents'}
            label={''}
            name={'agents'}
            itemText={'first_name'}
            renderItem={(item: any) => `${item.first_name} ${item.last_name}`}
            itemValue="id"
            items={agents}
            value={selectedId}
            defaultValue={null}
            onChange={(_name: any, value: any) => {
              console.log(value);
              if (value) {
                setSelectedId(value);
              } else {
                setSelectedId(null);
              }
            }}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => handleCloseDialog()}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleAssign} disabled={loading}>
          Asignar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GathererDialog;
