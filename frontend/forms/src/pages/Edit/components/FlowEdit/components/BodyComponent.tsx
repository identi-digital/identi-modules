import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Tooltip, styled } from '@mui/material';
import MaterialIcon from '@mui/material/Icon';
import { SchemaCondition, InstructionFlow } from '../../../../../models/forms';
import IconBox from '../../SharedComponents/IconBox';

const TextItemStyle = styled(Typography)(() => ({
  color: '#ffffff',
  marginRight: '8px',
  fontSize: '14px',
}));

const BoxOptionsStyle = styled(Box)(() => ({
  // backgroundColor: '#55A9EC',
  borderRadius: '50%',
  height: '20px',
  width: '20px',
  // color: '#FFFFFF',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&:hover': {
    cursor: 'pointer',
    color: '#55A9EC',
  },
  // fontSize: '11px'
}));

const BoxIconStyle = styled(Box)(() => ({
  color: '#ffffff',
  marginInline: '8px',
  display: 'flex',
  fontSize: '13px',
  borderRadius: '50%',
}));

// const BoxTitleStyle = styled(Box)(() => ({
//   width: 'fit-content',
//   backgroundColor: '#09304F',
//   borderRadius: '8px',
//   // marginInline: '8px',
//   padding: '2px'
// }));

const BoxTitleInitialStyle = styled(Box)(() => ({
  width: 'fit-content',
  backgroundColor: '#2D9CDB',
  borderRadius: '8px',
  // marginInline: '8px',
  padding: '2px',
}));

// const BoxTitleEndStyle = styled(Box)(() => ({
//   width: 'fit-content',
//   backgroundColor: '#EB5757',
//   borderRadius: '8px',
//   // marginInline: '8px',
//   padding: '2px'
// }));

const BoxBodyStyle = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  // padding: '10px',
  opacity: 0.9,
  // backgroundColor: '#FFFFFF',
  // backgroundColor: '#f2f5f7',
  borderRadius: '8px 8px 0px 0px',
  maxWidth: '320px',
}));

const BoxElementsStyle = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  // justifyContent: 'flex-end',
  paddingTop: '10px',
  opacity: 0.9,
}));

const ChipElementStyle = styled(Box)(() => ({
  border: '0.8px dashed rgba(204, 211, 221, 1)',
  borderRadius: '4px',
  padding: '12px',
}));

type BodyComponentProps = {
  keyComponent: string;
  title: string;
  iconTitle: string;
  isEditDialog: boolean;
  instruction: InstructionFlow;
  handleInstruction: (
    instruction?: InstructionFlow,
    keyComponent?: string,
    index?: number,
  ) => void;
  isConnecting: boolean;
  idxInstruction: number;
  //   handleCreateConnection: (e: any, instructionId: string, idxCondition: string | number) => void;
};

export type editingConditionals = {
  idInstruction: string;
  newConditions: SchemaCondition[];
};

const BodyComponent: React.FC<BodyComponentProps> = (
  props: BodyComponentProps,
) => {
  //   const classes = useStyles();
  const {
    iconTitle,
    title,
    instruction,
    keyComponent,
    handleInstruction,
    idxInstruction,
  } = props;
  const [name, setName] = useState<string>('');
  // const updateXarrow = useXarrow();

  const handleEdit = useCallback(() => {
    // updateXarrow();
    handleInstruction(instruction, keyComponent, idxInstruction);
  }, [handleInstruction, instruction, keyComponent, idxInstruction]);

  useEffect(() => {
    // console.log(instruction);
    if (
      instruction.schema_input &&
      Array.isArray(instruction.schema_input) &&
      instruction.schema_input.length > 0
    ) {
      setName(instruction.schema_input[0].value);
    }
  }, [instruction]);

  return (
    <div
      style={{
        zIndex: 3,
        width: '100%',
        marginInline: '8px',
      }}
    >
      {/* title */}
      <Box
        display="flex"
        justifyContent="space-between"
        sx={{
          '&:hover': {
            cursor: 'pointer',
          },
        }}
      >
        <IconBox
          type={instruction?.config?.tool?.name ?? ''}
          index={idxInstruction + 1}
        />
        {instruction?.is_initial && (
          <BoxTitleInitialStyle display="flex" alignItems="center">
            <Tooltip title={'Pregunta inicial'} placement="top">
              <BoxIconStyle>
                {
                  <MaterialIcon style={{ fontSize: 18 }}>
                    {iconTitle}
                  </MaterialIcon>
                }
              </BoxIconStyle>
            </Tooltip>
            <TextItemStyle>{title}</TextItemStyle>
          </BoxTitleInitialStyle>
        )}
        {/* {instruction?.is_end && (
          <BoxTitleEndStyle display="flex" alignItems="center">
            <Tooltip title={'Final'} placement="top">
              <BoxIconStyle>{<MaterialIcon style={{ fontSize: 18 }}>{iconTitle}</MaterialIcon>}</BoxIconStyle>
            </Tooltip>
            <TextItemStyle>{title}</TextItemStyle>
          </BoxTitleEndStyle>
        )} */}
        {/* {!instruction?.is_initial && !instruction?.is_end && (
          <BoxTitleStyle display="flex" alignItems="center">
            <BoxIconStyle>{<MaterialIcon style={{ fontSize: 18 }}>{iconTitle}</MaterialIcon>}</BoxIconStyle>
            <TextItemStyle>{title}</TextItemStyle>
          </BoxTitleStyle>
        )} */}

        <Box>
          <Tooltip title="Editar">
            <BoxOptionsStyle onClick={handleEdit}>
              {<MaterialIcon style={{ fontSize: 16 }}>{'edit'}</MaterialIcon>}
            </BoxOptionsStyle>
          </Tooltip>
        </Box>
      </Box>

      {/* body */}
      <BoxBodyStyle>
        <BoxElementsStyle>
          {/* head */}
          <Box>
            <ChipElementStyle style={{ fontSize: '14px', fontWeight: 600 }}>
              <Tooltip title={(name ?? '').length > 36 ? name ?? '' : ''}>
                <Typography
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '14px',
                    color: 'rgb(26, 35, 50)',
                    fontWeight: 500,
                  }}
                >
                  {name ?? ''}
                </Typography>
              </Tooltip>
            </ChipElementStyle>
          </Box>

          {/* schema_request */}
          <Box display={'flex'} flexDirection={'column'}></Box>
        </BoxElementsStyle>
      </BoxBodyStyle>
    </div>
  );
};

export default React.memo(BodyComponent);
