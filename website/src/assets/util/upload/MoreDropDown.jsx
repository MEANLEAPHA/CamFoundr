import React from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import {  Dropdown  } from 'antd';
import { EditOutlined, FlagOutlined, LinkOutlined, DeleteOutlined, UserOutlined, SettingOutlined, QuestionCircleOutlined, ExceptionOutlined, LogoutOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
export default function MoreDropDown ({post_type})  {
  const navigate = useNavigate();

  const menuItems = [
    post_type === 'content' && {
      label: (
        <li>
          <EditOutlined /> Edit Body
        </li>
      ),
      key: "0",
    },
    {
      label: (
        <li >
          <DeleteOutlined /> Delete
        </li>
      ),
      key: "1",
    },
    {
      label: (
        <li>
          <LinkOutlined /> Copy link
        </li>
      ),
      key: "2",
    },
    {
      label: (
        <li>
          <FlagOutlined /> Report Post
        </li>
      ),
      key: "3",
    }
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={["click"]} classNames={{ root: "profile-dropdown"}}>
      <div className='post-header-right'>
      <FontAwesomeIcon icon={faEllipsisVertical} className='icon-formore'/>
      </div>
    </Dropdown>
  );
};