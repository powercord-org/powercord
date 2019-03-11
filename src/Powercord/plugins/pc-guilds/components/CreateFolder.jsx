const { React } = require('powercord/webpack');
const { Button } = require('powercord/components');

module.exports = ({ openModal }) =>
  <div className='powercord-create-folder-container'>
    <div>
      <div className='powercord-create-folder-title'>Organize</div>
      <div className='powercord-create-folder-description'>Create new folders and clean your left sidebar</div>
    </div>
    <Button onClick={() => openModal()}>Create a new folder</Button>
  </div>;
