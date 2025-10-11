  update: async (id: number, subject: Partial<Subject>) => {
    return apiClient.put<Subject>(`/academic/subjects/${id}`, subject);
  },

  delete: async (id: number) => {
    return apiClient.delete<{ message: string }>(`/academic/subjects/${id}`);
  },
};