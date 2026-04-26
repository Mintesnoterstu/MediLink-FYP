export const assignmentService = {
  async assignPersonToInstitution(args: {
    userId: string;
    facilityId?: string;
    woredaId?: string;
    zoneId?: string;
  }) {
    // Backend currently does not expose explicit assignment mutations.
    // Keep this method non-throwing so legacy UIs don't crash.
    return { success: false, notImplemented: true, ...args };
  },
};

