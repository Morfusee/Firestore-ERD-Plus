import { Avatar, AvatarProps, Skeleton } from "@mantine/core";
import { ElementType } from "react";

type ProfileAvatarProps = {
  profilePicture: string | undefined;
  avatarSize?: number;
  isImageLoaded: boolean;
  setIsImageLoaded: (isImageLoaded: boolean) => void;
  onClick?: () => void;
  component?: any;
};

function ProfileAvatar({
  profilePicture,
  avatarSize = 100,
  isImageLoaded,
  setIsImageLoaded,
  onClick,
  component,
}: ProfileAvatarProps) {
  return (
    <>
      {!isImageLoaded ||
        (!profilePicture && (
          <Skeleton width={avatarSize} height={avatarSize} circle radius="xl" />
        ))}
      <Avatar
        component={component}
        size={avatarSize}
        src={profilePicture}
        style={{ display: isImageLoaded || !profilePicture ? "block" : "none" }} // Hide until loaded
        onLoad={() => setIsImageLoaded(true)}
        onError={() => setIsImageLoaded(false)} // Handle broken images
        onClick={onClick}
      />
    </>
  );
}

export default ProfileAvatar;
