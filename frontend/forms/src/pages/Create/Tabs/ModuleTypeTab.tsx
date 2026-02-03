import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Card,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import VerticalImg from '@ui/assets/img/vertical_img.png';
import {
  EntityNameTypes,
  ModuleChannelNames,
  TypeFlowTypes,
} from '../../../models/forms';
import Autocomplete from '@ui/components/atoms/Autocomplete/Autocomplete';

type Channel = {
  display_name: string;
  value: string;
};

type moduleType = {
  id: string;
  name: string;
  type: string;
  description: string;
  image: any;
  channels?: Channel[];
};

type moduleEntity = {
  id: string;
  value: string;
  display_name: string;
  disabled: boolean;
};

const ModuleTypesArray: moduleType[] = [
  {
    id: 'linear',
    name: 'Simple (vertical)',
    type: 'vertical',
    description:
      'Genera formularios rápidos y sencillos con una característica de lista',
    image: VerticalImg,
  },
  {
    id: 'branching',
    name: 'Libre (horizontal)',
    type: 'horizontal',
    description: 'Genera flujos de datos libres',
    image: VerticalImg,
    channels: [
      { value: 'identi connect', display_name: 'Identi connect' },
      {
        value: 'wsp',
        display_name: 'WhatsApp',
      },
      { value: 'call', display_name: 'Llamadas' },
    ],
  },
];

const ModuleTypesEntities: moduleEntity[] = [
  // {
  //   id: '1',
  //   value: 'PERSON',
  //   display_name: 'Persona',
  //   disabled: true,
  // },
  {
    id: '1',
    value: 'entity',
    display_name: 'Entidad',
    disabled: true,
  },
  {
    id: '2',
    value: 'free',
    display_name: 'Libre',
    disabled: true,
  },
  {
    id: '3',
    value: 'complementary',
    display_name: 'Complementario',
    disabled: false,
  },
];

type ModuleTypeTabProps = {
  handleOnSelectType: (type: string) => void;
  handleOnSelectFlowType: (type: string) => void;
  handleOnSelectChannel: (channel: string) => void;
  entityType?: EntityNameTypes;
  // moduleType?: TypeModuleTypes;
  flow_type?: TypeFlowTypes;
  channel_name?: ModuleChannelNames;
  isConfigure?: boolean;
};

const ModuleTypeTab: React.FC<ModuleTypeTabProps> = ({
  handleOnSelectType,
  handleOnSelectFlowType,
  handleOnSelectChannel,
  channel_name,
  entityType,
  flow_type,
  isConfigure,
}) => {
  const handleChangeEntityType = (e: any) => {
    handleOnSelectType(e.target.value);
  };

  const handleSelectModuleType = (e: any) => {
    handleOnSelectFlowType(e.target.value);
  };

  return (
    <Box mt={2}>
      <Box>
        {ModuleTypesArray.map((element: moduleType) => {
          return (
            <Card
              key={element.id}
              sx={{
                marginBlock: 1,
                color: 'primary.main',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box>
                <Radio
                  checked={flow_type === element.id}
                  onChange={handleSelectModuleType}
                  value={element.id}
                  name={`radio_${element.id}`}
                />
              </Box>
              <Box>
                <img src={element.image} alt={`im_${element.id}`} />
              </Box>
              <Box ml={2}>
                <Typography fontWeight={600}>{element.name ?? ''}</Typography>
                <Typography>{element.description ?? ''}</Typography>
              </Box>
              {element.channels && flow_type === 'branching' && (
                <Box ml={2} width={'200px'}>
                  <Autocomplete
                    id={'channel_name'}
                    label={'Canal'}
                    name={'channel_name'}
                    items={element.channels ?? []}
                    value={channel_name}
                    defaultValue={channel_name}
                    selectedValue={channel_name}
                    disableClearable={true}
                    onChange={(_name: string, value: string) => {
                      handleOnSelectChannel(value);
                      // console.log(name);
                      // console.log(value);
                    }}
                    itemText="display_name"
                    itemValue="value"
                  />
                </Box>
              )}
            </Card>
          );
        })}
      </Box>
      <FormControl sx={{ marginTop: 4, marginLeft: 4 }} disabled={isConfigure}>
        <FormLabel id="entity-buttons-group-label">Tipo de entidad</FormLabel>
        <RadioGroup
          aria-labelledby="entity-buttons-group-label"
          value={entityType}
          name="radio-buttons-group"
          onChange={handleChangeEntityType}
        >
          {ModuleTypesEntities.map((element: moduleEntity) => {
            return (
              <FormControlLabel
                key={`element_entity_${element.id}`}
                value={element.value}
                control={<Radio />}
                disabled={element.disabled}
                label={element.display_name}
              />
            );
          })}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default ModuleTypeTab;
