import { useState, useCallback, useEffect } from 'react';
import { Contract } from 'ethers';
import { Investigation, DashboardStats, UserRoles } from '@/types';

export const useInvestigations = (contract: Contract | null, address: string | null) => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalInvestigations: 0,
    activeInvestigations: 0,
    totalEvidence: 0,
    totalWitnesses: 0,
  });
  const [userRoles, setUserRoles] = useState<UserRoles>({
    isInvestigator: false,
    isJudge: false,
    isAdmin: false,
  });
  const [loading, setLoading] = useState(false);

  const updateDashboard = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const currentId = await contract.currentInvestigationId();
      const total = Number(currentId) - 1;

      let activeCount = 0;
      let totalEvidence = 0;
      let totalWitnesses = 0;

      for (let i = 1; i <= total; i++) {
        try {
          const [investigator, status, isActive] = await contract.getInvestigationBasicInfo(i);
          if (isActive && status === 1) {
            activeCount++;
          }

          const [evidenceCount, witnessCount] = await contract.getInvestigationCounts(i);
          totalEvidence += Number(evidenceCount);
          totalWitnesses += Number(witnessCount);
        } catch (error) {
          console.error(`Error fetching investigation ${i}:`, error);
          continue;
        }
      }

      setDashboardStats({
        totalInvestigations: total,
        activeInvestigations: activeCount,
        totalEvidence,
        totalWitnesses,
      });
    } catch (error) {
      console.error('Error updating dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const updateUserRoles = useCallback(async () => {
    if (!contract || !address) return;

    try {
      const isInvestigator = await contract.authorizedInvestigators(address);
      const isJudge = await contract.authorizedJudges(address);
      const admin = await contract.admin();
      const isAdmin = admin.toLowerCase() === address.toLowerCase();

      setUserRoles({
        isInvestigator,
        isJudge,
        isAdmin,
      });
    } catch (error) {
      console.error('Error updating user roles:', error);
    }
  }, [contract, address]);

  const loadInvestigations = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const currentId = await contract.currentInvestigationId();
      const total = Number(currentId) - 1;

      const investigationsList: Investigation[] = [];

      for (let i = 1; i <= total; i++) {
        try {
          const [investigator, status, isActive] = await contract.getInvestigationBasicInfo(i);
          const [startTime, endTime] = await contract.getInvestigationTimeInfo(i);
          const [evidenceCount, witnessCount] = await contract.getInvestigationCounts(i);

          investigationsList.push({
            id: i,
            encryptedCaseId: i, // Placeholder
            investigator,
            status: Number(status),
            startTime: Number(startTime),
            endTime: Number(endTime),
            isActive,
            evidenceCount: Number(evidenceCount),
            witnessCount: Number(witnessCount),
          });
        } catch (error) {
          console.error(`Error loading investigation ${i}:`, error);
          continue;
        }
      }

      setInvestigations(investigationsList);
    } catch (error) {
      console.error('Error loading investigations:', error);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    if (contract) {
      updateDashboard();
      updateUserRoles();
      loadInvestigations();
    }
  }, [contract, updateDashboard, updateUserRoles, loadInvestigations]);

  return {
    investigations,
    dashboardStats,
    userRoles,
    loading,
    updateDashboard,
    updateUserRoles,
    loadInvestigations,
  };
};
