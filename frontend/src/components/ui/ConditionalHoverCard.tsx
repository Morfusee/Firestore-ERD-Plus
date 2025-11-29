import { FloatingPosition, HoverCard, Text } from "@mantine/core";

function ConditionalHoverCard({
  dropdownText,
  children,
  showDropdown,
  openDelay,
  position,
  offset,
}: {
  dropdownText: string;
  children: React.ReactNode;
  showDropdown: boolean;
  openDelay?: number;
  position?: FloatingPosition;
  offset?: number;
}) {
  return (
    <>
      <HoverCard
        withArrow
        shadow="md"
        offset={offset || 25}
        openDelay={openDelay || 250}
        position={position || "right"}
      >
        <HoverCard.Target>{children}</HoverCard.Target>
        {showDropdown && (
          <HoverCard.Dropdown className="max-w-xs lg:max-w-xl">
            <Text size="sm">{dropdownText}</Text>
          </HoverCard.Dropdown>
        )}
      </HoverCard>
    </>
  );
}

export default ConditionalHoverCard;
