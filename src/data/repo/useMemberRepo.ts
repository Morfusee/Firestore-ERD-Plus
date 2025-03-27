import { useMemberStore } from "../../store/useMemberStore";
import { useProjectStore } from "../../store/useProjectStore";
import { AccessType, IProjectMembers } from "../../types/ProjectTypes";
import {
  getProjectMembersApi,
  addProjectMemberApi,
  updateProjectMemberApi,
  updateProjectMemberRoleApi,
  removeProjectMemberApi,
  updateProjectGeneralAccessApi,
} from "../api/membersApi";

const useMemberRepo = () => {
  const projectMembers = useMemberStore((state) => state.projectMembers);
  const setProjectMembers = useMemberStore((state) => state.setProjectMembers);
  const clearProjectMembers = useMemberStore(
    (state) => state.clearProjectMembers
  );
  const setLoading = useMemberStore((state) => state.setLoading);
  const setError = useMemberStore((state) => state.setError);

  const editAccess = useProjectStore((state) => state.editSelectedProjectAccess);

  const getProjectMembers = (projectId: string): IProjectMembers[] => {
    return projectMembers[projectId] || [];
  };

  const getMemberById = (
    projectId: string,
    memberId: string
  ): IProjectMembers | undefined => {
    const members = projectMembers[projectId] || [];
    return members.find((member) => member.id === memberId);
  };

  const fetchProjectMembers = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Get member")
      const response = await getProjectMembersApi(projectId);

      if (response.success) {
        setProjectMembers(projectId, response.data.members);
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch members";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addProjectMember = async (
    projectId: string,
    username: string,
    role: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await addProjectMemberApi(projectId, username, role);

      if (response.success) {
        const currentMembers = getProjectMembers(projectId);
        setProjectMembers(projectId, [
          ...currentMembers,
          response.data.createdMember,
        ]);
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add member";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProjectMember = async (
    projectId: string,
    memberId: string,
    updates: Partial<IProjectMembers>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateProjectMemberApi(
        projectId,
        memberId,
        updates
      );

      if (response.success) {
        const currentMembers = getProjectMembers(projectId);
        const updatedMembers = currentMembers.map((member) =>
          member.id === memberId ? response.data.updatedMember : member
        );
        setProjectMembers(projectId, updatedMembers);
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update member";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (
    projectId: string,
    memberId: string,
    role: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateProjectMemberRoleApi(
        projectId,
        memberId,
        role
      );

      if (response.success) {
        const currentMembers = getProjectMembers(projectId);
        const updatedMembers = currentMembers.map((member) =>
          member.id === memberId ? response.data.updatedMember : member
        );
        setProjectMembers(projectId, updatedMembers);
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update member role";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeProjectMember = async (projectId: string, memberId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await removeProjectMemberApi(projectId, memberId);

      if (response.success) {
        const currentMembers = getProjectMembers(projectId);
        const updatedMembers = currentMembers.filter(
          (member) => member.id !== memberId
        );
        setProjectMembers(projectId, updatedMembers);
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove member";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearMembers = (projectId: string) => {
    clearProjectMembers(projectId);
  };

  const updateProjectGeneralAccess = async (projectId: string, accessType: AccessType, role: string) => {
    try {

      const response = await updateProjectGeneralAccessApi(projectId, accessType, role)

      if (response.success) {
        editAccess({
          accessType,
          role
        })
      }

      return response

    } catch (e) {

    }
  }

  return {
    projectMembers,
    getProjectMembers,
    getMemberById,
    fetchProjectMembers,
    addProjectMember,
    updateProjectMember,
    updateMemberRole,
    removeProjectMember,
    clearMembers,
    updateProjectGeneralAccess,
  };
};

export default useMemberRepo;

