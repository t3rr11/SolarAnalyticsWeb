import React, { Component }  from 'react';
import { XYPlot, XAxis, YAxis, VerticalGridLines, AreaSeries } from 'react-vis';
import Error from '../modules/error';
import Loader from '../modules/loader';
import * as apiRequest from '../modules/api';
import Misc from '../modules/misc';

let updateTimer = null;

export class Live extends Component {

  state = {
    status: {
      status: 'startUp',
      statusText: 'Getting ready!',
      error: null,
      loading: true
    },
    generating: [],
    consuming: []
  }

  async componentDidMount() {
    this.setState({ status: { status: 'startingUp', statusText: `Getting Solar Analytics...`, loading: true } });
    this.GetAnalytics();

    //Set Interval of Refresh
    if(updateTimer === null) { updateTimer = setInterval(() => { this.setState({ nextUpdate: new Date().getTime() }); this.GetAnalytics(); }, 10000); }
  }
  async componentWillUnmount() { clearInterval(updateTimer); updateTimer = null; }
  
  async GetAnalytics() {
    const liveData = (await apiRequest.GetLiveData());

    if(liveData?.error === null) {
      //Grab previous logged data
      let generating = this.state.generating;
      let consuming = this.state.consuming;

      //Add new data
      if(liveData.data.inverter.data.PAC) { generating.push({ x: new Date(), y: liveData.data.inverter.data.PAC.Value }); }
      if(liveData.data.voltage.data.PowerReal_P_Sum) {
        if(liveData.data.inverter.data.PAC) { consuming.push({ x: new Date(), y: Math.round(liveData.data.voltage.data.PowerReal_P_Sum + liveData.data.inverter.data.PAC.Value) }); }
        else { consuming.push({ x: new Date(), y: Math.round(liveData.data.voltage.data.PowerReal_P_Sum) }); }
      }

      //Cap array at 1 minute
      if(generating.length > 60){ generating.shift(); }
      if(consuming.length > 60){ consuming.shift(); }

      //Save state
      this.setState({
        status: { status: 'ready', statusText: `Finished Loading Analytics.`, loading: false },
        generating, consuming
      });
    }
  }

  render () {
    const { generating, consuming } = this.state;
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error statusText={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content">
          <div className="live-graph-container">
            <div className="live-generating">
              <div className="graph">
                <div className="graph-title">Live Generation (10s Interval)</div>
                <div className="graph-data">
                  <div>Generating: { generating[generating.length-1] ? `${ generating[generating.length-1].y }W` : `Offline` }</div>
                </div>
                <XYPlot xType="time" width={ 1200 } height={ 250 } margin={{ left: 60 }} >
                  <VerticalGridLines style={{ stroke: "#333333" }} />
                  <XAxis title="Time" />
                  <YAxis title="Watts" />
                  <AreaSeries data={ generating } color={ "#00a6ef" } fill={ "#2d7a9c" } opacity={ 0.7 } curve={'curveLinear'} />
                </XYPlot>
              </div>
            </div>
            <div className="live-consumption">
              <div className="graph">
                <div className="graph-title">Live Consumption (10s Interval)</div>
                <div className="graph-data">
                  <div>Consusming: { consuming[consuming.length-1] ? `${ consuming[consuming.length-1].y }W` : `Offline` }</div>
                </div>
                <XYPlot xType="time" width={ 1200 } height={ 250 } margin={{ left: 60 }} >
                  <VerticalGridLines style={{ stroke: "#333333" }} />
                  <XAxis title="Time" />
                  <YAxis title="Watts" />
                  <AreaSeries data={ consuming } color={ "#ff7417" } fill={ "#885838" } opacity={ 0.9 } curve={'curveLinear'} />
                </XYPlot>
              </div>
            </div>
          </div>
        </div>
      )
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

export default Live;
