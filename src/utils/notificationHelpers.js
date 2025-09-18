export function parseNotification(content = "") {
  const meetingRegex = /\d{1,2}:\d{2} (AM|PM) - (video|voice)/i;
  const isMeeting = meetingRegex.test(content);

  if (isMeeting) {
    return {
      type: "Meeting",
      title: "Meeting",
      query: content
    };
  } else if (content.includes(' - ')) {
    const [title, ...queryParts] = content.split(' - ');
    return {
      type: "QnA",
      title: title.trim(),
      query: queryParts.join(' - ').trim()
    };
  } else {
    return {
      type: "QnA",
      title: content,
      query: ""
    };
  }
}

export function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  let h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function truncate(txt, n) {
  return txt && txt.length > n ? txt.slice(0, n) + '...' : txt;
}
