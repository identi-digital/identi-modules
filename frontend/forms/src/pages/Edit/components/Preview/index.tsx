import React from 'react';
import CellPhone from './components/CellPhone';
import { Instruction } from '../../../../models/forms';
import { State } from '@hookstate/core';
import { Box, MenuItem, Select, Typography, styled } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Button from '@ui/components/atoms/Button/Button';
import TextField from '@ui/components/atoms/TextField/TextField';
import VoiceSignatureComponent from '../QuestionEdit/components/VoiceSignatureComponent';
import ImageComponent from '../QuestionEdit/components/ImageComponent';
import GeoComponent from '../QuestionEdit/components/GeoComponent';

const HeaderStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
}));
const ContentStyled = styled('div')(() => ({
  height: '100%',
  paddingBlock: '16px',
  paddingInline: '32px',
  overflowY: 'auto',
}));
const QuestionNameStyled = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '16px',
}));

type PreviewPageProps = {
  instructions: State<Instruction[] | undefined, any>;
  moduleName: string;
};

const PreviewPage: React.FC<PreviewPageProps> = (props: PreviewPageProps) => {
  const { instructions, moduleName } = props;

  const renderInput = (schema: any, index: number, toolName: string) => {
    if (
      toolName === 'Punto georeferencial' ||
      toolName === 'Poligono geografico'
    ) {
      return (
        <GeoComponent
          type={toolName === 'Punto georeferencial' ? 'point' : 'polygon'}
        />
      );
    }
    if (schema) {
      switch (schema.type_value) {
        case 'option':
          const options = schema.option ?? [];
          return (
            <Select
              labelId={`demo-select-${index}`}
              id={`demo-select-small-${index}`}
              label=""
              value=""
              size="small"
              sx={{ mb: 1 }}
              fullWidth
            >
              {options.map((element: any, index_values: number) => {
                return (
                  <MenuItem
                    key={`${element.id}_${index_values}`}
                    value={element.id}
                  >
                    {element.value}
                  </MenuItem>
                );
              })}
            </Select>
          );
        case 'media':
          if (schema.type_media.includes('image')) {
            return <ImageComponent />;
          }
          if (schema.type_media.includes('audio')) {
            return <VoiceSignatureComponent />;
          }
          break;
        default:
          return (
            <TextField
              id={''}
              label={''}
              variant="outlined"
              size="small"
              name={''}
              value={''}
            />
          );
      }
    }
    return null;
  };

  return (
    <>
      <CellPhone>
        <Box
          display={'flex'}
          height={'100%'}
          flexDirection={'column'}
          justifyContent={'space-between'}
        >
          <HeaderStyled>
            <ArrowBack />
            <Typography sx={{ marginLeft: 2, fontSize: '14px' }}>
              {moduleName ?? ''}
            </Typography>
          </HeaderStyled>
          <ContentStyled className="scrollBarClass">
            {instructions.ornull.map(
              (instruction: State<Instruction>, index: number) => {
                if (!instruction.get().schema_gather) {
                  return null;
                }
                return (
                  <React.Fragment key={instruction.get().id}>
                    <QuestionNameStyled>
                      {index + 1}. {instruction.schema_gather.get()?.name}
                    </QuestionNameStyled>
                    {renderInput(
                      instruction.schema_gather.get(),
                      index,
                      instruction.get().config?.tool?.name ?? '',
                    )}
                  </React.Fragment>
                );
              },
            )}
          </ContentStyled>
          <Box display={'flex'} justifyContent={'center'}>
            <Button
              variant="contained"
              sx={{ minWidth: '200px' }}
              text={'Enviar'}
            />
          </Box>
        </Box>
      </CellPhone>
    </>
  );
};

export default PreviewPage;
