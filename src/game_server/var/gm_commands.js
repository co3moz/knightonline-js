const unit = require('../../core/utils/unit');

module.exports = {
	notice: (message, socket, opcode) => {
		// get first 3 characters for gm chat command
	    socket.shared.region.regionSend(socket, [
	      opcode,
	      8,
	      0, 0, 0, 0,
	      ...unit.string(message.substr(7, message.length), 'ascii')
	    ]);
	}
};