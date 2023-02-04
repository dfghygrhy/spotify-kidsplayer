export default class StorageClass extends MODULECLASS {
    constructor(parent, options) {
        super(parent, options);
        this.storage = parent;
        this.spotify = this.storage.spotify;
        this.api = this.spotify.api;
        this.imagePath = `${STORAGE_CONTAINER_PATH}/images`;
    }

    query(query, data) {

        /*const sql = this.storage.mysql.format(query, data);
        console.log('');
        LOG(this.label, sql);
        console.log('');
        */
        return new Promise((resolve, reject) => {
            if (data) {
                this.storage.pool.query(query, data, (error, result) => {
                    if (error) throw error;
                    resolve(result);
                });
            } else {
                this.storage.pool.query(query, (error, result) => {
                    if (error) throw error;
                    resolve(result);
                });
            }
        });
    }

    getBySpotifyId(spotifyId) {
        const query = `SELECT *
                       FROM ${this.table}
                       WHERE spotify_id = '${spotifyId}'`;

        return this.query(query).then(result => Promise.resolve(result[0]));
    }

    getById(id) {
        const query = `SELECT *
                       FROM ${this.table}
                       WHERE id = ${id}`;

        return this.query(query).then(result => Promise.resolve(result[0]));
    }

    create(data, table) {
        !table ? table = this.table : null;

        return new Promise((resolve, reject) => {
            const query = `INSERT INTO ${table}
                           SET ?`;

            this.query(query, data).then(result => {
                LOG(this.label, 'INSERTED:', result.insertId);
                this.getById(result.insertId).then(data => resolve(data));
            });
        });
    }

    addImages(id, images, table) {
        !table ? table = this.table : null;

        return this.storage.image.addBulk(table, id, images);
    }

    update(id, data) {
        const fields = Object.keys(data);

        const set = fields.map(f => `${f} = ?`).join(', ');

        const query = `UPDATE ${this.table}
                       SET ?
                       WHERE id = ${this.storage.mysql.escape(id)}`;

        const sql = this.storage.mysql.format(query, data);

        LOG('>>>>', sql);
        LOG();
        LOG();
        LOG();

        return this.query(query, data);
    }

}