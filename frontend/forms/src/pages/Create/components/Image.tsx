/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useState, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import LightBoxModal from '@ui/components/molecules/LightBoxModal/LightBoxModal';

type ImageComponentProps = {
  image: any;
  large?: boolean;
};

const LargeImgStyle = styled('img')(() => ({
  top: 0,
  objectFit: 'cover',
}));

const ImageComponent: React.FC<ImageComponentProps> = (
  props: ImageComponentProps,
) => {
  const { image, large = false } = props;
  const [openLightBox, setOpenLightBox] = useState<boolean>(false);

  const handleOpenLightbox = useCallback(() => {
    setOpenLightBox((prevValue: boolean) => !prevValue);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSetPhotoIndex = useCallback((index: number) => {}, []);

  return (
    <>
      <Box sx={{ cursor: 'zoom-in' }}>
        <LargeImgStyle
          style={{
            width: large ? '330px' : '150px',
            height: large ? '330px' : '150px',
          }}
          alt="large image"
          src={image}
          onClick={handleOpenLightbox}
        />
      </Box>

      <LightBoxModal
        images={[image]}
        photoIndex={0}
        setPhotoIndex={handleSetPhotoIndex}
        isOpen={openLightBox}
        onClose={handleOpenLightbox}
      />
    </>
  );
};

export default ImageComponent;
