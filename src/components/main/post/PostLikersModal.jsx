import React, {useCallback} from "react";
import {Modal, List, Avatar, Button, message} from "antd";
import {useAuth} from "../../../AuthContext";
import {useUserActions} from "../../../hooks/useUserActions.js"; // ✅ [추가] 커스텀 훅 임포트

/**
 * 게시글에 좋아요를 누른 사용자 목록을 보여주는 전용 모달 컴포넌트입니다.
 * FriendManagementModal에서 파생되었지만, 좋아요 목록 표시에 특화되어 기능이 단순화되었습니다.
 */
export default function PostLikersModal({open, onClose, users, onUpdate, loading}) { // ✅ [수정] loading prop 추가
    const {user: loggedInUser, following: myFollowing} = useAuth();

    // ✅ [수정] 커스텀 훅을 사용하여 액션 함수들을 가져옵니다.
    // 액션 완료 후 부모 컴포넌트에서 전달받은 onUpdate 함수를 실행하여 목록을 새로고침합니다.
    const {handleFollow, handleUnfollow, handleProfileClick} = useUserActions(onUpdate);

    const renderUserList = useCallback((userList) => (
        <List
            itemLayout="horizontal"
            dataSource={userList}
            loading={loading} // ✅ [추가] antd List 컴포넌트에 로딩 상태 전달
            locale={{emptyText: "좋아요를 누른 사용자가 없습니다."}}
            renderItem={(item) => {
                const isFollowing = Array.isArray(myFollowing)
                    ? myFollowing.some((f) => f.userId === item.userId)
                    : false;

                // 자기 자신인 경우
                if (loggedInUser && item.userId === loggedInUser.id) {
                    return (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar
                                    src={item.profileImageUrl || `https://api.dicebear.com/7.x/miniavs/svg?seed=${item.userId}`}
                                    onClick={() => handleProfileClick(item.userId, onClose)}
                                    style={{cursor: 'pointer'}}/>
                                }
                                title={<a onClick={() => handleProfileClick(item.userId, onClose)}
                                          style={{cursor: 'pointer'}}>{item.nickname} (나)</a>}
                            />
                        </List.Item>
                    );
                }

                // 다른 사용자인 경우
                return (
                    <List.Item
                        actions={[
                            isFollowing ? (
                                <Button onClick={() => handleUnfollow(item.userId)}>언팔로우</Button>
                            ) : (
                                <Button type="primary" onClick={() => handleFollow(item.userId)}>팔로우</Button>
                            ),
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar
                                src={item.profileImageUrl || `https://api.dicebear.com/7.x/miniavs/svg?seed=${item.userId}`}
                                onClick={() => handleProfileClick(item.userId, onClose)} style={{cursor: 'pointer'}}/>
                            }
                            title={<a onClick={() => handleProfileClick(item.userId, onClose)}
                                      style={{cursor: 'pointer'}}>{item.nickname}</a>}
                        />
                    </List.Item>
                );
            }}
        />
    ), [loggedInUser, myFollowing, handleFollow, handleUnfollow, handleProfileClick, onClose]);

    return (
        <Modal
            title="좋아요 누른 사람"
            open={open}
            onCancel={onClose}
            footer={null}
            width={400}
            zIndex={2000}
        >
            {renderUserList(users)}
        </Modal>
    );
}