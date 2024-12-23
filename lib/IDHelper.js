import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a numeric ID
 * @returns {number}
 */
function generateNumericId() {
    const uuid = uuidv4(); // Generate a UUID
    return parseInt(uuid.slice(0, 7).replace(/-/g, ''), 16); // Convert to a long numeric value
}

export default {
    generateNumericId
};