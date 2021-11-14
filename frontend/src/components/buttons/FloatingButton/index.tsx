import { useCallback, useState } from 'react';

import ButtonCommon from 'src/components/buttons/Common';
import PostWriteModal from 'src/components/modals/PostWriteModal';

import { FLOATING_BUTTON_WIDTH, FLOATING_BUTTON_HEIGHT } from 'src/globals/constants';

import { Wrapper } from './style';

function FloatingButton() {
  const [isModalShow, setIsModalShow] = useState(false);

  const changeModalShow = useCallback(() => {
    setIsModalShow((prevState) => !prevState);
  }, []);

  const handleClose = useCallback(() => {
    setIsModalShow(false);
  }, []);

  return (
    <Wrapper>
      {isModalShow && <PostWriteModal onClose={handleClose} />}
      <ButtonCommon
        onClick={changeModalShow}
        width={FLOATING_BUTTON_WIDTH}
        height={FLOATING_BUTTON_HEIGHT}
      >
        작성
      </ButtonCommon>
    </Wrapper>
  );
}

export default FloatingButton;
