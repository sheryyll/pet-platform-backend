const db = require('../config/database');

// Get sitter availability derived from SittingRequest
// Returns the sitter's occupied periods; frontend can infer availability
exports.getSitterAvailability = async (req, res) => {
	try {
		const { id } = req.params;
		const [rows] = await db.query(
			`SELECT sitting_id, start_date, end_date, status
			 FROM SittingRequest
			 WHERE sitter_id = ?
			 ORDER BY start_date ASC`,
			[id]
		);

		const occupied = rows.map(r => ({
			sitting_id: r.sitting_id,
			start_date: r.start_date,
			end_date: r.end_date,
			status: r.status
		}));

		return res.json({ sitter_id: Number(id), occupied });
	} catch (error) {
		console.error('Get sitter availability error:', error);
		return res.status(500).json({ message: 'Error fetching sitter availability', error: error.message });
	}
};


