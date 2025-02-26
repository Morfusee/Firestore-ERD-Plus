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

function ShareModal({ context, id }: ContextModalProps) {
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

  // useState to keep track project members locally.
  const [localMembers, setLocalMembers] = useState<IProjectMembers[]>([]);

  const currentUserRole = useMemo(() => {
    const currentMember = localMembers.find((member) => member.id === user?.id);
    return currentMember?.role || "Viewer";
  }, [localMembers, user?.id]);

  // Update local members whenever project members changes or the seleted projected changes
  useEffect(() => {
    if (selectedProject?.id && projectMembers[selectedProject.id]) {
      setLocalMembers(projectMembers[selectedProject.id]);
    }
  }, [selectedProject?.id, projectMembers]);

  useEffect(() => {
    if (!selectedProject) return;

    context.updateModal({
      modalId: id,
      title: (
        <Group gap="xs">
          {selectedProject.icon && (
            <Avatar src={selectedProject.icon} size="sm" />
          )}
          <Text fw={700} size="xl">
            {selectedProject.name || "Share Project"}
          </Text>
        </Group>
      ),
      size: "md",
      centered: false,
    });
  }, [selectedProject?.id]); // Only run when project ID changes

  // Fetch members when the modal opens and selectedProject changes
  useEffect(() => {
    if (!selectedProject?.id) return;

    const loadMembers = async () => {
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
    const displayName = newMemberEmail.split("@")[0];

    const newMember: IProjectMembers = {
      id: `temp-${Date.now()}`, // Use temp Id
      username: newMemberEmail,
      profileUrl: "",
      email: newMemberEmail,
      role: newMemberRole,
      displayName: displayName,
    };

    setLocalMembers((prev) => [...prev, newMember]);
    setNewMemberEmail("");
    setShowAddMember(false);
  };

  const handleUpdateRole = (memberId: string, newRole: string) => {
    setLocalMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };

  const handleRemoveMember = (memberId: string) => {
    setLocalMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  const handleSave = async () => {
    if (!selectedProject?.id) return;

    try {
      setInitialLoading(true);

      const currentMembers = projectMembers[selectedProject.id] || [];

      const addedMembers = localMembers.filter((member) =>
        member.id.startsWith("temp-")
      );

      const removedMembers = currentMembers.filter(
        (member) => !localMembers.some((m) => m.email === member.email)
      );

      const roleUpdatedMembers = localMembers.filter((member) => {
        const original = currentMembers.find((m) => m.id === member.id);
        return original && original.role !== member.role;
      });

      // Batch API Calls Instead of Looping
      await Promise.all([
        ...addedMembers.map((member) =>
          addProjectMember(selectedProject.id, member.email, member.role)
        ),
        ...removedMembers.map((member) =>
          removeProjectMember(selectedProject.id, member.id)
        ),
        ...roleUpdatedMembers.map((member) =>
          updateMemberRole(selectedProject.id, member.id, member.role)
        ),
      ]);

      await fetchProjectMembers(selectedProject.id);

      showNotification({
        color: "green",
        title: "Success",
        message: "Changes saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save changes:", error);
      showNotification({
        color: "red",
        title: "Error",
        message: "Failed to save changes. Please try again.",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  // Get members for the current project
  const members = useMemo(() => {
    return localMembers
      .filter((member) => member !== undefined && member !== null)
      .map((member) => ({
        id: member.id || "",
        profileUrl: member.profileUrl || "",
        name: member.displayName || "",
        email: member.email || "",
        role: member.role || "Viewer",
      }));
  }, [localMembers]);

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
        {(currentUserRole === "Owner" || currentUserRole === "Admin") && (
          <ActionIcon
            radius="lg"
            variant="subtle"
            onClick={() => setShowAddMember(true)}
          >
            <Tooltip label="Add new member">
              <IconPlus size={16} />
            </Tooltip>
          </ActionIcon>
        )}
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
          <Button
            onClick={handleAddMember}
            loading={isAddingMember}
            variant="filled"
          >
            Add
          </Button>
        </Group>
      )}

      <Stack my="sm">
        {initialLoading ? (
          <Center>
            <Loader size="sm" />
          </Center>
        ) : members.length > 0 ? (
          members.map((member) =>
            member ? (
              <MemberItem
                key={member.id}
                {...member}
                isCurrentUser={member.id === user?.id}
                onRoleChange={(newRole: string) =>
                  handleUpdateRole(member.id, newRole)
                }
                onRemove={() => handleRemoveMember(member.id)}
                currentUserRole={currentUserRole}
              />
            ) : null
          )
        ) : (
          <Text>No members found.</Text>
        )}
      </Stack>

      <Title order={5} mb="xs">
        General Access
      </Title>

      <GeneralItem
        accessType="restricted"
        role="Viewer"
        currentUserRole={currentUserRole}
      />

      {(currentUserRole === "Owner" || currentUserRole === "Admin") && (
        <Button
          variant="outline"
          fullWidth={true}
          mt={10}
          loading={initialLoading}
          onClick={handleSave}
        >
          Save
        </Button>
      )}
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
  currentUserRole: string;
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
  currentUserRole,
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
          <Text fw={500}>{role}</Text>
        ) : // Ensure only Admin and Owner can update member roles
        currentUserRole === "Admin" || currentUserRole === "Owner" ? (
          <Select
            variant="unstyled"
            w={90}
            comboboxProps={{ width: 110, position: "bottom-end" }}
            size="md"
            value={role}
            data={["Viewer", "Editor", "Admin"]}
            onChange={(value) => value && onRoleChange(value)}
          />
        ) : (
          <Text fw={500}>{role}</Text>
        )}

        {/* Ensure only owner or admin can remove members, but not the owner */}
        {(currentUserRole === "Admin" || currentUserRole === "Owner") &&
          role !== "Owner" && (
            <Menu>
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconDotsVertical />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {/* <Menu.Item >Remove Member</Menu.Item> */}
                {role === "Owner" && <Menu.Item>Change Owner</Menu.Item>}
                <Menu.Item onClick={onRemove}>
                  {isCurrentUser ? "Leave Project" : "Remove Member"}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
      </Group>
    </Group>
  );
}

type AccessType = "restricted" | "anyone";

interface GeneralItemProps {
  accessType: AccessType;
  role: string;
  currentUserRole: string;
}

function GeneralItem({ accessType, role, currentUserRole }: GeneralItemProps) {
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
            disabled={
              !(currentUserRole === "Admin" || currentUserRole === "Owner")
            } // Disable if not Admin or Owner
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
        disabled={!(currentUserRole === "Admin" || currentUserRole === "Owner")} // Disable if not Admin or Owner
      />
    </Group>
  );
}

export default ShareModal;
