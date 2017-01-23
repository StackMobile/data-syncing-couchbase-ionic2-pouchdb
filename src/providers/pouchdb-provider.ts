import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Injectable, EventEmitter} from '@angular/core';
// import PouchDB from 'pouchdb';
// import * as PouchdbAuthentication from 'pouchdb-authentication';

let PouchDB = require("pouchdb");

@Injectable()
export class PouchDBProvider {

  private isInstantiated: boolean;
  private database: any;
  private listener: EventEmitter<any> = new EventEmitter();

  public constructor() {
    if (!this.isInstantiated) {
      this.database = new PouchDB("pouchDB");
      this.isInstantiated = true;
    }
  }

  public fetch() {
    return this.database.allDocs({include_docs: true});
  }

  public getDoc(id) {
    return this.database.get(id);
  }

  public remove(id: string){
    this.database.get(id).then(doc => {
      console.log(doc);
      return this.database.remove(doc);
    }).then(result =>  {
      console.log(result);
    }).catch(function (err) {
      console.log(err);
    });
  }

  public put(document: any, id: string) {
    document._id = id;
    return this.getDoc(id).then(result => {
      document._rev = result._rev;
      return this.database.put(document);
    }, error => {
      if (error.status == "404") {
        return this.database.put(document);
      } else {
        return new Promise((resolve, reject) => {
          reject(error);
        });
      }
    });

  }

  public syncData() {
    let remote = "http://couchbaseserver-1.622c32bd.cont.dockerapp.io:4984/app/";
    let remoteDatabase = new PouchDB(remote);
    this.database.sync(remoteDatabase, {
      live: true
    }).on('change', change => {
      this.listener.emit(change);
    });
  }

  public getChangeListener() {
    return this.listener;
  }

}
