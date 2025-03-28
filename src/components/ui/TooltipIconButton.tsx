import { ActionIcon, ActionIconProps, Tooltip } from "@mantine/core";
import { ReactNode } from "react";


interface TooltipIconButtonProps extends ActionIconProps{
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export default function TooltipIconButton({
  icon,
  label,
  disabled,
  active,
  onClick,
  ...iconProps
}: TooltipIconButtonProps) {
  return (
    <Tooltip label={label}>
      <ActionIcon
        {...iconProps}
        variant={ active ? "filled" : iconProps.variant || "subtle"}
        size={iconProps.size || "md"}
        radius={iconProps.radius || "sm"}
        disabled={disabled}
        onClick={onClick}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );
}