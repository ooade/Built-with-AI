export const requestPermission = () => {
	if (!('Notification' in window)) return;
	if (Notification.permission === 'default') {
		Notification.requestPermission().catch((err) =>
			console.error('Notification permission failed', err),
		);
	}
};

export const notify = (title: string, body?: string) => {
	if (!('Notification' in window)) return;

	// Only notify if the user is not currently looking at the page
	if (document.hidden && Notification.permission === 'granted') {
		try {
			new Notification(title, {
				body,
			});
		} catch (e) {
			console.error('Notification failed', e);
		}
	}
};
