var Database = {

	getItem: async function(key) {
		var result = await localforage.getItem(key);

		await result;

		return result;
	},

	setItem: async function(key, data) {
		await localforage.setItem(key, data);
		return;
	}
}