const { React } = require('powercord/webpack');
const { FormNotice, settings: { SwitchItem } } = require('powercord/components');

/*
 * i18n notes: this section is intentionally left not translated.
 * It's only here for the few curious people who want to brick their Discord install
 */

class Labs extends React.Component {
  render () {
    return <>
      <FormNotice
        imageData={{
          width: 60,
          height: 60,
          src: '/assets/0694f38cb0b10cc3b5b89366a0893768.svg'
        }}
        type={FormNotice.Types.DANGER}
        title='Experiments ahead!'
        body={<>Any feature you see here is under development and is likely to be unfinished and/or broken. They
          are provided as-is and there's a 50% chance devs will yell at you for using them and say your cat is
          fat. <b>Use them at your own risk</b>.</>}
      />
      {powercord.api.labs.experiments.sort((a, b) => a.date > b.date ? -1 : a.date < b.date ? 1 : 0).map(e => this.renderItem(e))}
    </>;
  }

  /**
   * @param {PowercordExperiment} experiment
   */
  renderItem (experiment) {
    const enabled = powercord.api.labs.isExperimentEnabled(experiment.id);
    const date = new Date(experiment.date);

    // No i wont write proper css
    return (
      <div style={{ marginTop: '20px' }}>
        <SwitchItem
          note={experiment.description}
          value={enabled}
          onChange={() => {
            if (enabled) {
              powercord.api.labs.disableExperiment(experiment.id);
            } else {
              powercord.api.labs.enableExperiment(experiment.id);
            }
            this.forceUpdate();
          }}
        >
          <b>{date.getDate().toString().padStart(2, '0')}/{(date.getMonth() + 1).toString().padStart(2, '0')}/{date.getFullYear()}</b> {experiment.name}
        </SwitchItem>
      </div>
    );
  }
}

module.exports = Labs;
