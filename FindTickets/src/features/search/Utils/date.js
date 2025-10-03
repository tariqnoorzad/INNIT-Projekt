// utils/date.js

// Formater ISO-dato til brugervenligt format
export function formatDateFriendly(isoString) {
    if (!isoString) return 'Ukendt dato';
  
    const dateObj = new Date(isoString);
    if (isNaN(dateObj)) return isoString; // fallback
  
    // Check om tiden er 00:00, så viser vi kun dato
    const hasTime = dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0;
  
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const datePart = dateObj.toLocaleDateString('da-DK', options);
  
    if (hasTime) {
      const timePart = dateObj.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
      return `${datePart}, ${timePart}`;
    }
  
    return datePart;
  }
  
  // Valgfrit: langt format til detaljerede visninger
  export function formatDateLong(isoString) {
    if (!isoString) return 'Ukendt dato';
  
    const dateObj = new Date(isoString);
    if (isNaN(dateObj)) return isoString;
  
    return dateObj.toLocaleString('da-DK', {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  }