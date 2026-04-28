import { create } from 'zustand';

const useJobStore = create((set, get) => ({
  jobs: [],
  selectedJob: null,
  filters: {
    city: '',
    type: '',
    experienceLevel: '',
    minSalary: '',
    maxSalary: '',
    isWalkIn: false,
    isGuaranteedHiring: false,
    fastTrack: false,
    isFresherFriendly: false,
    search: '',
    category: '',
    sort: '-createdAt',
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  },
  isLoading: false,
  viewMode: 'grid', // 'grid' | 'list'

  setJobs: (jobs) => set({ jobs }),
  setSelectedJob: (job) => set({ selectedJob: job }),
  setPagination: (pagination) => set({ pagination }),
  setLoading: (isLoading) => set({ isLoading }),
  setViewMode: (viewMode) => set({ viewMode }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pagination: { ...state.pagination, page: 1 },
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    })),

  resetFilters: () =>
    set({
      filters: {
        city: '',
        type: '',
        experienceLevel: '',
        minSalary: '',
        maxSalary: '',
        isWalkIn: false,
        isGuaranteedHiring: false,
        fastTrack: false,
        isFresherFriendly: false,
        search: '',
        category: '',
        sort: '-createdAt',
      },
      pagination: { total: 0, page: 1, limit: 20, pages: 1 },
    }),

  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, page },
    })),

  getActiveFilterCount: () => {
    const { filters } = get();
    let count = 0;
    if (filters.city) count++;
    if (filters.type) count++;
    if (filters.experienceLevel) count++;
    if (filters.minSalary || filters.maxSalary) count++;
    if (filters.isWalkIn) count++;
    if (filters.isGuaranteedHiring) count++;
    if (filters.fastTrack) count++;
    if (filters.isFresherFriendly) count++;
    if (filters.category) count++;
    return count;
  },
}));

export default useJobStore;
