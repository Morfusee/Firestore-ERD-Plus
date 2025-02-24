import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Center,
  CopyButton,
  Divider,
  Group,
  Loader,
  Menu,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import {
  IconCopy,
  IconDotsVertical,
  IconLock,
  IconPlus,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import useProjectRepo from "../../data/repo/useProjectRepo";
import { IProjectMembers } from "../../types/ProjectTypes";
import useMemberRepo from "../../data/repo/useMemberRepo";
import { showNotification } from "@mantine/notifications";
import useUserRepo from "../../data/repo/useUserRepo";

function ShareModal({ context, id, innerProps }: ContextModalProps) {
  const { user } = useUserRepo();
  const { selectedProject } = useProjectRepo();
  const {
    projectMembers,
    fetchProjectMembers,
    addProjectMember,
    updateMemberRole,
    removeProjectMember,
  } = useMemberRepo();

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Viewer");

  const [initialLoading, setInitialLoading] = useState(true);
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    context.updateModal({
      modalId: id,
      title: (
        <Group spacing="xs">
          {selectedProject?.icon && (
            <Avatar src={selectedProject.icon} size="sm" />
          )}
          <Text fw={700} size="xl">
            {selectedProject?.name || "Share Project"}
          </Text>
        </Group>
      ),
      size: "md",
      centered: false,
    });
  }, [selectedProject]);

  // Fetch members when the modal opens and selectedProject changes
  useEffect(() => {
    const loadMembers = async () => {
      if (!selectedProject?.id) return;

      try {
        setInitialLoading(true);
        await fetchProjectMembers(selectedProject.id);
      } catch (error) {
        console.error("Failed to load members:", error);
        showNotification({
          color: "red",
          title: "Error",
          message: "Failed to load members. Please try again.",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadMembers();
  }, [selectedProject?.id]);

  const handleAddMember = async () => {
    if (!selectedProject?.id || !newMemberEmail) {
      showNotification({
        color: "red",
        title: "Error",
        message: "Missing required information.",
      });
      return;
    }

    try {
      setIsAddingMember(true);
      await addProjectMember(selectedProject.id, newMemberEmail, newMemberRole);
      await fetchProjectMembers(selectedProject.id);
      setNewMemberEmail("");
      setShowAddMember(false);
      showNotification({
        color: "green",
        title: "Success",
        message: "Member added successfully",
      });
    } catch (error) {
      console.error("Failed to add member:", error);
      showNotification({
        color: "red",
        title: "Error",
        message: "Failed to add member. Please try again.",
      });
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!selectedProject?.id) return;

    try {
      await updateMemberRole(selectedProject.id, memberId, newRole);
      await fetchProjectMembers(selectedProject.id);
    } catch (error) {
      console.error("Failed to update role:", error);
      showNotification({
        color: "red",
        title: "Error",
        message: "Failed to update role. Please try again.",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedProject?.id) return;

    try {
      await removeProjectMember(selectedProject.id, memberId);
      await fetchProjectMembers(selectedProject.id);
      showNotification({
        color: "green",
        title: "Success",
        message: "Member removed successfully",
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
      showNotification({
        color: "red",
        title: "Error",
        message: "Failed to remove member. Please try again.",
      });
    }
  };

  // Get members for the current project
  const members = useMemo(() => {
    if (
      !selectedProject?.id ||
      !projectMembers ||
      !projectMembers[selectedProject.id]
    ) {
      return [];
    }

    return projectMembers[selectedProject.id]
      .filter(
        (member: IProjectMembers | undefined): member is IProjectMembers =>
          member !== undefined && member !== null
      )
      .map((member: IProjectMembers) => ({
        id: member.id || "",
        profileUrl: member.profileUrl || "",
        name: member.displayName || "",
        email: member.email || "",
        role: member.role || "Viewer",
      }));
  }, [selectedProject?.id, projectMembers]);

  return (
    <Box className="w-full h-full">
      <Group>
        <TextInput
          className="flex-1"
          label="Shareable Link"
          rightSection={
            <CopyButton value="http://localhost.com">
              {({ copied, copy }) => (
                <ActionIcon variant="light" onClick={copy}>
                  <IconCopy size={16} />
                </ActionIcon>
              )}
            </CopyButton>
          }
          readOnly
          value="http://localhost.com"
        />
      </Group>

      <Divider my="md" />

      <Group justify="space-between">
        <Title order={5}>Members</Title>
        <ActionIcon
          radius="lg"
          variant="subtle"
          onClick={() => setShowAddMember(true)}
        >
          <Tooltip label="Add new member">
            <IconPlus size={16} />
          </Tooltip>
        </ActionIcon>
      </Group>

      {showAddMember && (
        <Group mt="sm">
          <TextInput
            className="flex-1"
            placeholder="Enter email address"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.currentTarget.value)}
          />
          <Select
            value={newMemberRole}
            onChange={(value) => setNewMemberRole(value || "Viewer")}
            data={[
              { value: "Viewer", label: "Viewer" },
              { value: "Editor", label: "Editor" },
              { value: "Admin", label: "Admin" },
            ]}
          />
          <Button onClick={handleAddMember} loading={isAddingMember}>
            Add
          </Button>
        </Group>
      )}

      <Stack my="sm">
        {initialLoading ? (
          <Center>
            <Loader size="sm" />
          </Center>
        ) : (
          members.map((member) => (
            <MemberItem
              key={member.id}
              {...member}
              isCurrentUser={member.id === user?.id}
              onRoleChange={(newRole: string) =>
                handleUpdateRole(member.id, newRole)
              }
              onRemove={() => handleRemoveMember(member.id)}
            />
          ))
        )}
      </Stack>

      <Title order={5} mb="xs">
        General Access
      </Title>

      <GeneralItem accessType="restricted" role="Viewer" />
    </Box>
  );
}

interface MemberItemProps {
  id: string;
  profileUrl: string;
  name: string;
  email: string;
  role: string;
  onRoleChange: (newRole: string) => void;
  onRemove: () => void;
  isCurrentUser: boolean;
}

function MemberItem({
  id,
  profileUrl,
  name,
  email,
  role,
  onRoleChange,
  onRemove,
  isCurrentUser,
}: MemberItemProps) {
  const truncatedEmail = email.length > 25 ? `${email.slice(0, 22)}...` : email;

  return (
    <Group
      className="rounded-md transition-color hover:bg-neutral-500 hover:hover:bg-opacity-20"
      px="xs"
      py={6}
      justify="space-between"
    >
      <Group gap="sm">
        <Avatar size={42} src={profileUrl} />

        <Stack gap={0}>
          <Text fw={500}>
            {name}{" "}
            {isCurrentUser && (
              <Text component="span" c="green.5">
                (You)
              </Text>
            )}
          </Text>
          <Text c="dimmed" size="sm">
            {truncatedEmail}
          </Text>
        </Stack>
      </Group>

      <Group>
        {role === "Owner" ? (
          <Text fw={500}>Owner</Text>
        ) : (
          <Select
            variant="unstyled"
            w={90}
            comboboxProps={{ width: 110, position: "bottom-end" }}
            size="md"
            value={role}
            data={["Viewer", "Editor", "Admin"]}
            onChange={onRoleChange}
          />
        )}

        <Menu>
          <Menu.Target>
            <ActionIcon variant="subtle">
              <IconDotsVertical />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {/* <Menu.Item >Remove Member</Menu.Item> */}
            {role === "Owner" && <Menu.Item>Change Owner</Menu.Item>}
            <Menu.Item onClick={onRemove}>{isCurrentUser ? "Leave Project" : "Remove Member"}</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}

type AccessType = "restricted" | "anyone";

interface GeneralItemProps {
  accessType: AccessType;
  role: string;
}

function GeneralItem({ accessType, role }: GeneralItemProps) {
  const typeDisplay: Record<AccessType, { title: string; subtext: string }> = {
    restricted: {
      title: "Restricted",
      subtext: "",
    },
    anyone: {
      title: "Anyone with a link",
      subtext: "",
    },
  };

  return (
    <Group
      className="rounded-md transition-color hover:bg-neutral-500 hover:hover:bg-opacity-20"
      px="xs"
      py={6}
      justify="space-between"
    >
      <Group gap="sm">
        <Avatar size={42} src="">
          <IconLock size={22} />
        </Avatar>

        <Stack gap={0}>
          <Select
            variant="unstyled"
            size="md"
            value={typeDisplay[accessType].title}
            data={["Restricted", "Anyone with a link"]}
          />
          <Text c="dimmed" size="sm">
            {typeDisplay[accessType].subtext}
          </Text>
        </Stack>
      </Group>

      <Select
        variant="unstyled"
        w={90}
        comboboxProps={{ width: 110, position: "bottom-end" }}
        size="md"
        value={role}
        data={["Viewer", "Editor", "Admin"]}
      />
    </Group>
  );
}

export default ShareModal;
