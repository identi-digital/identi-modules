import React, {
  useCallback
  // useEffect
} from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

type TitleComponentProps = {
  name?: string;
  description?: string;
  handleDeleteToolSchema?: (index: number, indexSchemaSchema: number) => void;
  idxSchema?: number;
  index?: number;
  // lastIndex: number;
  lastIndexComponent?: number;
};

const TitleComponent: React.FC<TitleComponentProps> = (props: TitleComponentProps) => {
  const { name, description, handleDeleteToolSchema, index, idxSchema, lastIndexComponent } = props;
  //   const classes = useStyles();

  const deleteSchema = useCallback(() => {
    if (index !== undefined && lastIndexComponent !== undefined) {
      handleDeleteToolSchema && handleDeleteToolSchema(index, lastIndexComponent);
    }
  }, [handleDeleteToolSchema, index, lastIndexComponent]);

  // useEffect(() => {
  //   console.log(index);
  //   console.log(idxSchema);
  //   console.log(lastIndexComponent);
  // }, [idxSchema, index, lastIndexComponent]);

  return (
    <Box display="flex" justifyContent={'space-between'}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 500,
            color: 'rgba(47, 51, 54, 1)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {name ?? ''}
        </Typography>
      </Box>
      <Box display={'flex'} alignItems={'center'}>
        {handleDeleteToolSchema && lastIndexComponent === idxSchema && (
          <Tooltip title="Eliminar sección">
            <Box
              sx={{
                '&:hover': {
                  cursor: 'pointer'
                }
              }}
              onClick={deleteSchema}
            >
              <DeleteForeverIcon />
            </Box>
          </Tooltip>
        )}
        {description && (
          <Box
            sx={{
              '&:hover': {
                cursor: 'help'
              }
            }}
          >
            <Tooltip title={description ?? ''} placement="top">
              <InfoOutlinedIcon />
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TitleComponent;
