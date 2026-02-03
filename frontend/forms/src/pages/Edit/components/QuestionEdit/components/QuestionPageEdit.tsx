import React, { useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  Tooltip,
  Typography,
} from '@mui/material';
import { SchemaInput } from '../../../../../models/forms';
import IconBox from '../../SharedComponents/IconBox';
import TextComponent from './TextComponent';
import VoiceSignatureComponent from './VoiceSignatureComponent';
import ImageComponent from './ImageComponent';
import GeoComponent from './GeoComponent';
import { State } from '@hookstate/core';
import RenderInputEdit from './RenderInputEdit';
import { Link } from '@mui/icons-material';

type PageStyledProps = {
  hideIcon?: boolean;
};

const PageStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'hideIcon',
})<PageStyledProps>(({ hideIcon }) => ({
  width: '100%',
  padding: hideIcon ? '32px 8px' : '32px 48px',
  height: hideIcon ? 'auto' : '400px',
  borderRadius: '4px',
  backgroundColor: 'white',
  border: '1px solid #F1F1F1',
  boxShadow: '0px 1px 2px -1px rgba(16, 24, 40, 0.1)',
  marginBottom: '32px',
}));

type QuestionPageEditProps = {
  currentInstruction: State<SchemaInput | undefined, any>;
  index: number;
  isDefault: boolean;
  varsArray: string[];
  // hideIcon?: boolean;
  flowView: boolean;
  // handleChangeCurrentInstruction: () => void;
};

const QuestionPageEdit = React.forwardRef<
  HTMLDivElement,
  QuestionPageEditProps
>((props: QuestionPageEditProps) => {
  const { currentInstruction, index, varsArray, flowView, isDefault } = props;
  console.log(currentInstruction);
  const updateGatherOptions = useCallback(
    (values: any[]) => {
      currentInstruction.schema_gather.option.set(values);
    },
    [currentInstruction.schema_gather.option],
  );

  return (
    <PageStyled className="scrollBarClass" hideIcon={flowView}>
      <Box display={'flex'} alignItems={'start'}>
        {!flowView && (
          <Box mt={1}>
            <IconBox
              type={currentInstruction?.get().config?.tool?.name ?? ''}
              index={index}
            />
          </Box>
        )}
        {!currentInstruction.get().config?.is_channel && (
          <Box ml={2} mt={1} width={'80%'}>
            <Typography>
              {currentInstruction?.get().config?.tool?.name ?? ''}
            </Typography>
          </Box>
        )}
        <Box ml={2} width={'80%'}>
          {currentInstruction.ornull &&
            currentInstruction.schema_input.ornull?.map(
              (element: any, index: number) => {
                console.log(element);
                return (
                  <Box
                    key={`schema_${index}_${element.get().id}`}
                    display={'flex'}
                  >
                    {element.get().is_hidden ?? false ? null : (
                      <>
                        <RenderInputEdit
                          schema={element}
                          isDefault={isDefault}
                          varsArray={varsArray}
                          updateGatherOptions={updateGatherOptions}
                        />
                      </>
                    )}
                  </Box>
                );
              },
            )}
        </Box>
      </Box>
      {!flowView && (
        <Box>
          {currentInstruction.get().config?.tool?.name === 'Texto corto' && (
            <TextComponent
              size="small"
              text={currentInstruction?.get().config?.tool?.place_holder ?? ''}
            />
          )}
          {currentInstruction.get().config?.tool?.name === 'Texto largo' && (
            <TextComponent
              size="medium"
              text={currentInstruction?.get().config?.tool?.place_holder ?? ''}
            />
          )}
          {currentInstruction.get().config?.tool?.name === 'Mostrar texto' && (
            <TextComponent
              size="small"
              text={currentInstruction?.get().config?.tool?.place_holder ?? ''}
            />
          )}
          {currentInstruction.get().config?.tool?.name === 'Número' && (
            <TextComponent
              size="small"
              text={currentInstruction?.get().config?.tool?.place_holder ?? ''}
            />
          )}
          {currentInstruction.get().config?.tool?.name === 'Fecha' && (
            <TextComponent
              size="small"
              text={currentInstruction?.get().config?.tool?.place_holder ?? ''}
            />
          )}
          {currentInstruction.get().config?.tool?.name === 'Calculadora' && (
            <TextComponent size="small" text={'Campo calculado'} />
          )}
          {currentInstruction.get().config?.tool?.name === 'Audio' && (
            <VoiceSignatureComponent />
          )}
          {currentInstruction.get().config?.tool?.name === 'Firma digital' && (
            <TextComponent
              size="medium"
              text={currentInstruction?.get().config?.tool?.place_holder ?? ''}
            />
          )}
          {currentInstruction.get().config?.tool?.name === 'Foto' && (
            <ImageComponent />
          )}

          {(currentInstruction.get().config?.tool?.name ===
            'Punto georeferencial' ||
            currentInstruction.get().config?.tool?.name ===
              'Poligono geografico') && (
            <GeoComponent
              type={
                currentInstruction.get().config?.tool?.name ===
                'Punto georeferencial'
                  ? 'point'
                  : 'polygon'
              }
            />
          )}
        </Box>
      )}
      {!currentInstruction.get().config?.is_channel && (
        <Box mt={3}>
          <Typography sx={{ color: 'gray' }}>Variables obtenidas</Typography>
          <List>
            {currentInstruction.ornull &&
              currentInstruction.schema_variables.ornull?.map(
                (element: any, index: number) => {
                  return (
                    <ListItem
                      key={`schema_variable_${index}_${element.get().name}`}
                    >
                      {/* <TextComponent size="small" text={element.get().name ?? ''} /> */}
                      <ListItemIcon sx={{ minWidth: '30px' }}>
                        <Tooltip title="Nueva variable">
                          <Link />
                        </Tooltip>
                      </ListItemIcon>
                      <ListItemText primary={element.get().name ?? ''} />
                      {/* <Typography>{element.get().name}</Typography> */}
                    </ListItem>
                  );
                },
              )}
          </List>
        </Box>
      )}
    </PageStyled>
  );
});

export default QuestionPageEdit;
