import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisVertical} from "@fortawesome/free-solid-svg-icons";
import { Menu, Dropdown } from 'antd';
import {
    EditOutlined,
    LinkOutlined,
    FlagOutlined,
    ShareAltOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import handleDeletePost from './deletePost';
import handleCopyLink from './copyLink';

const DotDropDown = ({ ownerId, post_type, post_id, text_body, contentId }) => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [openReport, setOpenReport] = useState(false);

  const isOwner = Number(ownerId) === Number(user?.id);

  const menuItemsForAll = [
    {
      label: (
        <li onClick={() => handleCopyLink(post_id)}>
          <LinkOutlined /> Copy link
        </li>
      ),
      key: "0",
    },
    {
      label: (
        <li onClick={(e) => {
          e.stopPropagation();
          navigate("/reportPost", {
            state: {
              postId: post_id,
              userId: ownerId
            }
          })
        }}>
          <FlagOutlined /> Report Post
        </li>
      ),
      key: "1",
    },
  ];

  const menuItemsForOwner = [
    post_type === "content" && {
      label: (
        <li
          onClick={(e) => {
            e.stopPropagation();
            navigate("/edit/content", {
              state: { postId: post_id, contentId, bodyText: text_body, mode: "edit" },
            });
          }}
        >
          <EditOutlined /> Edit Text Body
        </li>
      ),
      key: "0",
    },
    {
      label: (
        <li onClick={() => handleDeletePost(post_id)}>
          <DeleteOutlined /> Delete
        </li>
      ),
      key: "1",
    },
    {
      label: (
        <li onClick={() => handleCopyLink(post_id)}>
          <LinkOutlined /> Copy link
        </li>
      ),
      key: "2",
    },
    {
      label: (
        <li onClick={(e) => {
          e.stopPropagation();
          navigate("/reportPost", {
            state: {
              postId: post_id,
              userId: ownerId
            }
          })
        }}>
          <FlagOutlined /> Report Post
        </li>
      ),
      key: "3",
    },
  ].filter(Boolean);

  return (
    <Dropdown
      menu={{ items: isOwner ? menuItemsForOwner : menuItemsForAll }}
      trigger={["click"]}
      classNames={{ root: "profile-dropdown" }}
    >
      <div className="post-header-right">
        <FontAwesomeIcon icon={faEllipsisVertical} className="icon-formore" />
      </div>
    </Dropdown>
  );
}; 

export default DotDropDown;