import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Center,
  Combobox,
  CopyButton,
  Divider,
  Group,
  Input,
  InputBase,
  Loader,
  Menu,
  rem,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  useCombobox,
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
import { AccessType, IProjectMembers } from "../../types/ProjectTypes";
import useMemberRepo from "../../data/repo/useMemberRepo";
import { showNotification } from "@mantine/notifications";
import useUserRepo from "../../data/repo/useUserRepo";
import { IUser } from "../../store/useUserStore";
import { FetchedUsers } from "../../types/APITypes";
import { useDebouncedCallback } from "@mantine/hooks";

function ShareModal({ context, id }: ContextModalProps) {
  const { user, getUserByUsername } = useUserRepo();
  const { selectedProject } = useProjectRepo();
  const {
    projectMembers,
    fetchProjectMembers,
    addProjectMember,
    updateMemberRole,
    removeProjectMember,
    updateProjectGeneralAccess,
  } = useMemberRepo();

  // UI States
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // Data States
  const [matchingUsers, setMatchingUsers] = useState<
    FetchedUsers["users"] | undefined
  >([]);
  // useState to keep track project members locally.
  const [localMembers, setLocalMembers] = useState<IProjectMembers[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const currentUserRole = useMemo(() => {
    const currentMember = localMembers.find((member) => member.id === user?.id);
    return currentMember?.role || "Viewer";
  }, [localMembers, user?.id]);

  // Get members for the current project
  const members = useMemo(() => {
    return localMembers
      .filter((member) => member !== undefined && member !== null)
      .map((member) => ({
        id: member.id || "",
        profilePicture: member.profilePicture || "",
        name: member.displayName || "",
        username: member.username || "",
        role: member.role || "Viewer",
      }));
  }, [localMembers]);

  const memoizedMatchingUsers = useMemo(
    () => matchingUsers || [],
    [matchingUsers]
  );

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

  const handleAddMember = async (
    newMember: Omit<IUser, "email"> | undefined
  ) => {
    if (!selectedProject?.id || !newMember) {
      showNotification({
        color: "red",
        title: "Error",
        message: "Missing required information.",
      });
      return;
    }

    const newMemberData: IProjectMembers = {
      id: `temp-${Date.now()}`, // Use temp Id
      username: newMember.username,
      profilePicture: newMember.profilePicture || "",
      role: "Viewer",
      displayName: newMember.displayName || "",
    };

    setLocalMembers((prev) => [...prev, newMemberData]);
    setSearchTerm("");
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
        (member) => !localMembers.some((m) => m.username === member.username)
      );

      const roleUpdatedMembers = localMembers.filter((member) => {
        const original = currentMembers.find((m) => m.id === member.id);
        return original && original.role !== member.role;
      });

      // Batch API Calls Instead of Looping
      await Promise.all([
        ...addedMembers.map((member) =>
          addProjectMember(selectedProject.id!, member.username, member.role)
        ),
        ...removedMembers.map((member) =>
          removeProjectMember(selectedProject.id!, member.id)
        ),
        ...roleUpdatedMembers.map((member) =>
          updateMemberRole(selectedProject.id!, member.id, member.role)
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

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const debouncedFetchUsers = useDebouncedCallback(
    async (username: IUser["username"]) => {
      try {
        // Search for users
        const fetchedUsers = await getUserByUsername(
          username,
          localMembers.map((member) => member.username)
        );

        // Set the fetched users to the state
        setMatchingUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        // Set searching state to false
        setIsSearching(false);
      }
    },
    250
  );

  const handleOpenSearch = () => {
    // Don't search if there's already matching users
    if (memoizedMatchingUsers.length > 0) return;

    // Set searching state to true
    setIsSearching(true);
    combobox.openDropdown();

    // Fetch users with empty string to get all users
    debouncedFetchUsers("");
  };

  const handleSearchInput = async (username: IUser["username"]) => {
    // Set searching state to true
    setIsSearching(true);
    setSearchTerm(username);

    // Fetch users with the username
    debouncedFetchUsers(username);
  };

  const handleUserSelection = (username: string) => {
    setSearchTerm(username);

    // Fetch users with the username
    debouncedFetchUsers(username);

    // Find the selected user from the matching users
    const selectedUser = memoizedMatchingUsers.find(
      (user) => user.username === username
    );

    // Add the selected user to the members list
    if (selectedUser) {
      handleAddMember(selectedUser);
    }

    // Close the dropdown
    combobox.closeDropdown();
  };

  return (
    <Box className="w-full h-full">
      <Group>
        <TextInput
          className="flex-1"
          label="Shareable Link"
          rightSection={
            <CopyButton value={`${window.location.origin}/${selectedProject?.id}` || ""}>
              {({ copied, copy }) => (
                <ActionIcon variant="light" onClick={copy}>
                  <IconCopy size={16} />
                </ActionIcon>
              )}
            </CopyButton>
          }
          readOnly
          value={`${window.location.origin}/${selectedProject?.id}` || ""}
        />
      </Group>

      <Divider my="md" />

      <Group justify="space-between">
        <Title order={5}>Members</Title>
      </Group>

      {(currentUserRole === "Owner" || currentUserRole === "Admin") && (
        <Group mt="sm">
          <Combobox
            store={combobox}
            withinPortal={true}
            onOptionSubmit={(value) => handleUserSelection(value)}
          >
            <Combobox.Target>
              <InputBase
                rightSection={<Combobox.Chevron />}
                value={searchTerm}
                onChange={(event) => {
                  combobox.openDropdown();
                  combobox.updateSelectedOptionIndex();
                  handleSearchInput(event.currentTarget.value);
                }}
                onClick={handleOpenSearch}
                onFocus={() => combobox.openDropdown()}
                onBlur={() => {
                  combobox.closeDropdown();
                  handleSearchInput(searchTerm || "");
                }}
                placeholder="Add members by username"
                rightSectionPointerEvents="none"
                w={"100%"}
              />
            </Combobox.Target>
            <Combobox.Dropdown>
              <CustomDropdown
                isSearching={isSearching}
                memoizedMatchingUsers={memoizedMatchingUsers}
              />
            </Combobox.Dropdown>
          </Combobox>
        </Group>
      )}

      <ScrollArea.Autosize my="sm" mah={rem(300)} offsetScrollbars={true}>
        <Stack gap={5}>
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
      </ScrollArea.Autosize>

      <Title order={5} mb="xs">
        General Access
      </Title>

      <GeneralItem
        accessType={selectedProject?.generalAccess.accessType || "Restricted"}
        role={selectedProject?.generalAccess.role || "Viewer"}
        currentUserRole={currentUserRole}
        onAccessTypeChange={(type) => {
          if (selectedProject && selectedProject.id && type) {
            updateProjectGeneralAccess(
              selectedProject.id, 
              type as AccessType, 
              selectedProject.generalAccess.role
            )
          }
        }}
        onAccessRoleChange={(role) => {
          if (selectedProject && selectedProject.id && role) {
            updateProjectGeneralAccess(
              selectedProject.id, 
              selectedProject.generalAccess.accessType, 
              role
            )
          }
        }}
      />

      {(currentUserRole === "Owner" || currentUserRole === "Admin") && (
        <Button
          variant="filled"
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

function CustomSelectOption({ user }: { user: Omit<IUser, "email"> }) {
  return (
    <Group>
      <Avatar src={user.profilePicture} size={32} />
      <Stack gap={0}>
        <Text>{user.username}</Text>
        <Text size="xs" c="dimmed">
          {user.displayName}
        </Text>
      </Stack>
    </Group>
  );
}

function CustomDropdown({
  isSearching,
  memoizedMatchingUsers,
}: {
  isSearching: boolean;
  memoizedMatchingUsers: FetchedUsers["users"];
}) {
  if (isSearching) {
    return (
      <Stack p={rem(10)}>
        <Center>
          <Loader size="sm" />
        </Center>
      </Stack>
    );
  }

  if (memoizedMatchingUsers.length > 0) {
    return (
      <Combobox.Options>
        {memoizedMatchingUsers.map((option) => (
          <Combobox.Option key={option.id} value={option.username}>
            <CustomSelectOption user={option} />
          </Combobox.Option>
        ))}
      </Combobox.Options>
    );
  }

  return (
    <Stack p={rem(10)}>
      <Center>
        <Text size="sm" c="dimmed">
          No users found
        </Text>
      </Center>
    </Stack>
  );
}

interface MemberItemProps {
  id: string;
  profilePicture: string;
  name: string;
  username: string;
  role: string;
  onRoleChange: (newRole: string) => void;
  onRemove: () => void;
  isCurrentUser: boolean;
  currentUserRole: string;
}

function MemberItem({
  id,
  profilePicture,
  name,
  username,
  role,
  onRoleChange,
  onRemove,
  isCurrentUser,
  currentUserRole,
}: MemberItemProps) {
  const truncatedEmail =
    username.length > 25 ? `${username.slice(0, 22)}...` : username;
  
  return (
    <Group
      className="rounded-md transition-color hover:bg-neutral-500 hover:hover:bg-opacity-20"
      px="xs"
      py={6}
      justify="space-between"
    >
      <Group gap="sm">
        <Avatar size={42} src={profilePicture} />

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



interface GeneralItemProps {
  accessType: AccessType;
  role: string;
  currentUserRole: string;
  onAccessTypeChange: (accessType: string | null) => void;
  onAccessRoleChange: (accessRole: string | null) => void
}

function GeneralItem({ 
  accessType, role, currentUserRole, onAccessTypeChange, onAccessRoleChange 
}: GeneralItemProps) {
  const typeDisplay: Record<AccessType, { title: string; subtext: string }> = {
    Restricted: {
      title: "Restricted",
      subtext: "",
    },
    Link: {
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
            value={accessType}
            data={[
              {label: "Restricted", value: "Restricted"}, 
              {label: "Anyone with a link", value: "Link"}
            ]}
            disabled={
              !(currentUserRole === "Admin" || currentUserRole === "Owner")
            } // Disable if not Admin or Owner
            onChange={(accessType) => onAccessTypeChange(accessType)}
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
        data={["Viewer", "Editor"]}
        disabled={!(currentUserRole === "Admin" || currentUserRole === "Owner")} // Disable if not Admin or Owner
        onChange={(accessRole) => onAccessRoleChange(accessRole)}
      />
    </Group>
  );
}

export default ShareModal;
