export const formatDate = (date) => {
    return new Date(date).toLocaleString('ru-KZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };