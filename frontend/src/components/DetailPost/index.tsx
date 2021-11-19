import { useState } from 'react';
import { useQuery } from 'react-query';
import PropTypes from 'prop-types';

import PostImages from 'src/components/images/PostImages';
import ProfileSet from 'src/components/sets/ProfileSet';
import LikeButton from 'src/components/buttons/LikeButton';
import CommentButton from 'src/components/buttons/CommentButton';
import EchoButton from 'src/components/buttons/EchoButton';
import LikesButton from 'src/components/buttons/LikesButton';
import PostContent from 'src/components/PostContent';
import PostComments from 'src/components/PostComments';
import CommentInput from 'src/components/inputs/CommentInput';
import LoadingIndicator from 'src/components/LoadingIndicator';
import { Row, Col } from 'src/components/Grid';

import {
  DETAIL_POST_IMAGE_WIDTH,
  DETAIL_POST_IMAGE_HEIGHT,
  DETAIL_COMMENT_INPUT_WIDTH,
  DETAIL_POST_CONTENT_WIDTH,
  DETAIL_COMMENT_ICON_SIZE,
  DETAIL_COMMENT_ICON_PADDING,
  DETAIL_PROFILE_SET_MARGIN_LEFT,
} from 'src/globals/constants';

import { CommentType } from 'src/types';

import { Fetcher } from 'src/utils';

import { ImageSection, PostInfoSection } from './style';

interface Props {
  postID: string;
}

function DetailPost({ postID }: Props) {
  const { isLoading, data: post } = useQuery(['detail', 'posts', postID], () =>
    Fetcher.getDetailPost(postID),
  );
  const [comments, setComments] = useState<CommentType[]>([]);
  const [likeCount, setLikeCount] = useState(post?.likes?.length ?? 0);
  const onCommentDelete = (commentID: string) => {
    setComments((prevState: CommentType[]) =>
      [...prevState].filter((comment) => comment._id !== commentID),
    );
  };
  const onCommentWrite = (comment: CommentType) => {
    setComments((prevState: CommentType[]) => [...prevState, comment]);
  };
  if (isLoading) {
    return <LoadingIndicator />;
  }
  return (
    <Row>
      <ImageSection>
        <PostImages
          images={post!.images!}
          width={DETAIL_POST_IMAGE_WIDTH}
          height={DETAIL_POST_IMAGE_HEIGHT}
        />
      </ImageSection>
      <PostInfoSection>
        <Col>
          <ProfileSet
            profileImage={post!.user!.profileImage}
            username={post!.user!.username!}
            marginLeft={DETAIL_PROFILE_SET_MARGIN_LEFT}
          />
          <Row justifyContent='space-evenly'>
            <LikeButton postID={post!._id!} postLikes={post!.likes!} setLikeCount={setLikeCount} />
            <CommentButton postID={post!._id!} />
            <EchoButton postID={post!._id!} />
          </Row>
          {likeCount !== 0 && <LikesButton postID={post!._id!} likeCount={likeCount} />}
          <PostContent content={post!.content!} width={DETAIL_POST_CONTENT_WIDTH} expanded />
          <PostComments
            postID={post!._id!}
            comments={comments}
            expanded
            onCommentDelete={onCommentDelete}
          />
          <CommentInput
            postID={post!._id!}
            onCommentWrite={onCommentWrite}
            width={DETAIL_COMMENT_INPUT_WIDTH}
            iconSize={DETAIL_COMMENT_ICON_SIZE}
            padding={DETAIL_COMMENT_ICON_PADDING}
          />
        </Col>
      </PostInfoSection>
    </Row>
  );
}

DetailPost.propTypes = {
  postID: PropTypes.string.isRequired,
};

export default DetailPost;
