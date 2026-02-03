import React from 'react';
import { ReactNode } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
// material
import { Theme, styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { SxProps } from '@mui/system';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
// utils

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }: any) => ({
  //   width: 144,
  height: 154,
  margin: 'auto',
  //   borderRadius: '50%',
  padding: theme.spacing(1),
  //   border: `1px dashed ${theme.palette.grey[500_32]}`
}));

const DropZoneStyle = styled('div')({
  zIndex: 0,
  width: '100%',
  height: '100%',
  outline: 'none',
  display: 'flex',
  overflow: 'hidden',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  '& > *': { width: '100%', height: '100%' },
  '&:hover': {
    cursor: 'pointer',
    '& .placeholder': {
      zIndex: 9,
    },
  },
});

// const PlaceholderStyle = styled('div')(({ theme }: any) => ({
//   display: 'flex',
//   position: 'absolute',
//   alignItems: 'center',
//   flexDirection: 'column',
//   justifyContent: 'center',
//   color: theme.palette.text.secondary,
//   //   backgroundColor: theme.palette.background.neutral,
//   transition: theme.transitions.create('opacity', {
//     easing: theme.transitions.easing.easeInOut,
//     duration: theme.transitions.duration.shorter
//   }),
//   '&:hover': { opacity: 0.72 }
// }));

// ----------------------------------------------------------------------

// type CustomFile = File & {
//   path?: string;
//   preview?: string;
//   file_name: string;
// };

type UploadAvatarProps = DropzoneOptions & {
  error?: boolean;
  file: any | string | null;
  caption?: ReactNode;
  sx?: SxProps<Theme>;
  isRounded?: boolean;
};

export default function UploadAvatar({
  error,
  file,
  sx,
  isRounded,
  ...other
}: UploadAvatarProps) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  }: any = useDropzone({
    multiple: false,
    ...other,
  });

  return (
    <>
      <RootStyle sx={sx} style={{ width: isRounded ? '231px' : 'auto' }}>
        <DropZoneStyle
          {...getRootProps()}
          sx={{
            ...(isDragActive && { opacity: 0.72 }),
            ...((isDragReject || error) && {
              color: 'error.main',
              //   borderColor: 'error.light'
              //   bgcolor: 'error.lighter'
            }),
            borderRadius: isRounded ? '50%' : '6px',
            border: '1px solid rgba(0, 0, 0, 0.23)',
          }}
        >
          <input {...getInputProps()} />

          {/* {file && (
            <Box
              component="img"
              alt="logo"
              src={isString(file) ? file : file.preview}
              sx={{ zIndex: 8, objectFit: 'cover' }}
            />
          )} */}

          {/* <PlaceholderStyle
            className="placeholder"
            sx={{
              ...(file && {
                opacity: 0,
                color: 'common.white',
                // bgcolor: 'grey.900',
                border: '1px solid rgba(15, 20, 25, 1)',
                '&:hover': { opacity: 0.72 }
              })
            }}
          >
            <Box sx={{ mb: 1, color: 'rgba(0, 171, 85, 1)' }}>
              <InsertPhotoIcon sx={{ width: 27, height: 27 }} />
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(0, 171, 85, 1)' }}>
              {file ? file.file_name : 'Subir imagen'}
            </Typography>
            <Typography variant="caption">{'PNG, JPG, GIF hasta 5MB'}</Typography>
          </PlaceholderStyle> */}
          <Box
            display="flex"
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Box sx={{ mb: 1, color: 'rgba(0, 171, 85, 1)' }}>
              <InsertPhotoIcon sx={{ width: 27, height: 27 }} />
            </Box>
            {/* <PhotoCameraOutlined style={{ fontSize: '4rem' }} /> */}
            <Typography
              variant="caption"
              sx={{ fontSize: 14, color: 'rgba(0, 171, 85, 1)' }}
            >
              {file ? file.file_name : 'Subir imagen'}
            </Typography>
            <Typography variant="caption">
              {'PNG, JPG, GIF hasta 5MB'}
            </Typography>
          </Box>
        </DropZoneStyle>
      </RootStyle>
      {/* {caption} */}
    </>
  );
}
