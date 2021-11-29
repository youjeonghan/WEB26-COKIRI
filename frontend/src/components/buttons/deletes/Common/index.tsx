import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { IoCloseCircleOutline } from 'react-icons/io5';

import IconButton from 'src/components/buttons/IconButton';
import DeleteModal from 'src/components/modals/DeleteModal';

import {
  DELETE_BUTTON_SIZE,
  DELETE_BUTTON_PADDING,
  DASHBOARD_DELETE_BUTTON_WIDTH,
  DASHBOARD_DELETE_BUTTON_HEIGHT,
} from 'src/globals/constants';

interface Props {
  onClick: VoidFunction;
  content: string;
}

function DeleteCommon({ onClick, content }: Props) {
  const [isModalShow, setIsModalShow] = useState(false);

  const changeModalShow = useCallback(() => {
    setIsModalShow((prevState) => !prevState);
  }, []);

  const handleClose = useCallback(() => {
    setIsModalShow(false);
  }, []);

  return (
    <>
      {isModalShow && (
        <DeleteModal
          onConfirm={onClick}
          onClose={handleClose}
          title={`${content}을(를) 삭제하시겠습니까?`}
        />
      )}
      <IconButton
        onClick={changeModalShow}
        width={DASHBOARD_DELETE_BUTTON_WIDTH}
        height={DASHBOARD_DELETE_BUTTON_HEIGHT}
        size={DELETE_BUTTON_SIZE}
        padding={DELETE_BUTTON_PADDING}
      >
        <IoCloseCircleOutline />
      </IconButton>
    </>
  );
}

DeleteCommon.propTypes = {
  onClick: PropTypes.func.isRequired,
  content: PropTypes.string.isRequired,
};

export default DeleteCommon;
