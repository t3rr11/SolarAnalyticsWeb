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
    load: [],
    grid: [],
  }

  async componentDidMount() {
    this.setState({ status: { status: 'startingUp', statusText: `Getting Solar Analytics...`, loading: true } });
    this.GetAnalytics();

    //Set Interval of Refresh
    if(updateTimer === null) { updateTimer = setInterval(() => { this.setState({ nextUpdate: new Date().getTime() }); this.GetAnalytics(); }, 1000); }
  }
  async componentWillUnmount() { clearInterval(updateTimer); updateTimer = null; }
  
  async GetAnalytics() {
    const liveData = (await apiRequest.GetLiveData());
    const liveFlow = liveData.data.liveFlow.data;

    if(liveData?.error === null) {
      //Grab previous logged data
      let generating = this.state.generating;
      let load = this.state.load;
      let grid = this.state.grid;

      //Add new data
      generating.push({ x: new Date(), y: Math.round(liveFlow.Site.P_PV) });
      load.push({ x: new Date(), y: Math.round(liveFlow.Site.P_Load) });
      grid.push({ x: new Date(), y: Math.round(liveFlow.Site.P_Grid) });

      //Cap array at 1 minute
      if(generating.length > 60){ generating.shift(); }
      if(load.length > 60){ load.shift(); }
      if(grid.length > 60){ grid.shift(); }

      //Save state
      this.setState({
        status: { status: 'ready', statusText: `Finished Loading Analytics.`, loading: false },
        generating, load, grid
      });
    }
  }

  render () {
    const { generating, load, grid } = this.state;
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error statusText={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content">
          <div className="live-graph-container">
            <div className="live-generating">
              <div className="graph">
                <div className="graph-title">Live Production (10s Interval)</div>
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
            <div className="live-load">
              <div className="graph">
                <div className="graph-title">Live Consumption (10s Interval)</div>
                <div className="graph-data">
                  <div>Consusming: { load[load.length-1] ? `${ load[load.length-1].y }W` : `Offline` }</div>
                </div>
                <XYPlot xType="time" width={ 1200 } height={ 250 } margin={{ left: 60 }} >
                  <VerticalGridLines style={{ stroke: "#333333" }} />
                  <XAxis title="Time" />
                  <YAxis title="Watts" />
                  <AreaSeries data={ load } color={ "#ff7417" } fill={ "#885838" } opacity={ 0.9 } curve={'curveLinear'} />
                </XYPlot>
              </div>
            </div>
            <div className="live-grid">
              <div className="graph">
                <div className="graph-title">Live Grid (10s Interval)</div>
                <div className="graph-data">
                  <div>{ grid[grid.length-1].y > 0 ? 'Buying' : 'Selling' }: { grid[grid.length-1] ? `${ grid[grid.length-1].y }W` : `Offline` }</div>
                </div>
                <XYPlot xType="time" width={ 1200 } height={ 250 } margin={{ left: 60 }} >
                  <VerticalGridLines style={{ stroke: "#333333" }} />
                  <XAxis title="Time" />
                  <YAxis title="Watts" />
                  <AreaSeries data={ grid } color={ "#18c100" } fill={ "#006d0a" } opacity={ 0.9 } curve={'curveLinear'} />
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
