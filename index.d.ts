declare module "mongoist" {

  type ReadPreference = "primary" | "primaryPreferred" | "secondary" | "secondaryPreferred" | "nearest" | null;

  type WriteConcern = {
    readonly w?: number | "majority" | string | null,
    readonly wtimeout?: number | null,
    readonly j?: boolean
  };

  export declare class Timestamp {
    MAX_VALUE: Timestamp;
    MIN_VALUE: Timestamp;
    NEG_ONE: Timestamp;
    ONE: Timestamp;
    ZERO: Timestamp;
    fromBits(low: number, high: number): Timestamp;
    fromInt(value: number): Timestamp;
    fromNumber(value: number): Timestamp;
    fromString(value: string, radix?: number): Timestamp;
    constructor(low: number, high: number): Timestamp;
    add(timestamp: Timestamp): Timestamp;
    and(timestamp: Timestamp): Timestamp;
    compare(timestamp: Timestamp): number;
    div(timestamp: Timestamp): Timestamp;
    equals(timestamp: Timestamp): boolean;
    getHighBits(): number;
    getLowBits(): number;
    getLowBitsUnsigned(): number;
    getNumBitsAbs(): number;
    greaterThan(timestamp: Timestamp): boolean;
    greaterThanOrEqual(timestamp: Timestamp): boolean;
    isNegative(): boolean;
    isOdd(): boolean;
    isZero(): boolean;
    lessThan(timestamp: Timestamp): boolean;
    lessThanOrEqual(timestamp: Timestamp): boolean;
    modulo(timestamp: Timestamp): Timestamp;
    multiply(timestamp: Timestamp): Timestamp;
    negate(): Timestamp;
    not(): Timestamp;
    notEquals(timestamp: Timestamp): boolean;
    or(timestamp: Timestamp): Timestamp;
    shiftLeft(numBits: number): Timestamp;
    shiftRight(numBits: number): Timestamp;
    shiftRightUnsigned(numBits: number): Timestamp;
    subtract(timestamp: Timestamp): Timestamp;
    toInt(): number;
    toJSON(): string;
    toNumber(): number;
    toString(radix?: number): string;
    xor(timestamp: Timestamp): Timestamp;
  }

  type TransactionOptions = {
    readonly readConcern?: any,
    readonly writeConcern?: WriteConcern,
    readonly readPreference?: ReadPreference
  };

  interface ClientSession {
    id: any;
    abortTransaction: (() => Promise<any>);
    abortTransaction: ((callback: ((arg0: Error | null, reply?: null) => any)) => void);
    advanceOperationTime: ((timestamp: Timestamp) => void);
    commitTransaction: (() => Promise<any>);
    commitTransaction: ((callback: ((arg0: Error | null, reply?: null) => any)) => void);
    endSession: (() => void);
    endSession: ((callback: ((arg0: Error | null, reply?: null) => any)) => void);
    endSession: ((
      options: {
        [K in string]: any;
      } | null,
      callback: ((arg0: Error | null, reply?: null) => any)
    ) => void);
    equals: ((clientSession: ClientSession) => boolean);
    incrementTransactionNumber: (() => void);
    inTransaction: (() => boolean);
    startTransaction: ((options?: TransactionOptions) => void);
    withTransaction: ((
      fn: ((session: ClientSession) => Promise<any>),
      options?: TransactionOptions
    ) => Promise<null | void>);
  }

  type BulkExecuteResult = {
    ok: 1,
    writeErrors: any[],
    writeConcernErrors: any[],
    nInserted: number,
    nUpserted: number,
    nMatched: number,
    nModified: number,
    nRemoved: number,
    upserted: any[]
  };

  type BulkJSONValue = {
    nInsertOps: number,
    nUpdateOps: number,
    nRemoveOps: number,
    nBatches: number
  };

  interface FindSyntax {
    upsert: (() => FindSyntax);
    remove: (() => void);
    removeOne: (() => void);
    update: ((update: any) => void);
    updateOne: ((update: any) => void);
    replaceOne: ((update: any) => void);
  }

  export interface Bulk {
    ensureCommand: ((cmdName: string, bulkCollection: any) => any);
    find: ((selector: ReadOnlyQuery) => FindSyntax);
    insert: ((
      doc: {
        [K in string]: any;
      }
    ) => void);
    execute: (() => Promise<BulkExecuteResult>);
    pushCurrentCmd: (() => void);
    tojson: (() => BulkJSONValue);
  }

  type BulkOptions = {
    readonly ignoreUndefined?: boolean,
    readonly session?: ClientSession
  } & WriteConcern;

  export type ConnectionOptions = {
    poolSize?: number,
    ssl?: boolean,
    sslValidate?: boolean,
    sslCA?: Buffer | string[],
    sslCert?: Buffer | string,
    sslKey?: Buffer | string,
    sslPass?: Buffer | string,
    sslCRL?: Buffer,
    autoReconnect?: boolean,
    noDelay?: boolean,
    keepAlive?: number,
    keepAliveInitialDelay?: number,
    connectTimeoutMS?: number,
    family?: 4 | 6 | null,
    socketTimeoutMS?: number,
    reconnectTries?: number,
    reconnectInterval?: number,
    ha?: boolean,
    haInterval?: number,
    replicaSet?: string | null,
    secondaryAcceptableLatencyMS?: number,
    acceptableLatencyMS?: number,
    connectWithNoPrimary?: boolean,
    authSource?: string | null,
    forceServerObjectId?: boolean,
    serializeFunctions?: boolean,
    ignoreUndefined?: boolean,
    raw?: boolean,
    bufferMaxEntries?: number,
    promoteValues?: boolean,
    promoteBuffers?: boolean,
    promoteLongs?: boolean,
    domainsEnabled?: boolean,
    bufferMaxEntries?: number,
    readPreference?: ReadPreference,
    // Some sort of vaguely-defined generator for primary keys.
    pkFactory?: any,
    promiseLibrary?: any | null,
    readConcern?: {
      level?: "local" | "available" | "majority" | "linearizable" | "snapshot"
    },
    maxStalenessSeconds?: number | null,
    appname?: string | null,
    loggerLevel?: string | null,
    // TODO: is this right?
    logger?: typeof console | null,
    checkServerIdentity?: boolean | any,
    validateOptions?: any,
    auth?: {
      user?: string,
      password?: string
    },
    authMechanism?: "MDEFAULT" | "GSSAPI" | "PLAIN" | "MONGODB-X509" | "SCRAM-SHA-1",
    compression?: any,
    fsync?: boolean,
    readPreferenceTags?: any[],
    numberOfRetries?: number,
    auto_reconnect?: boolean,
    minSize?: number
  } & WriteConcern;

  type Connection = any;
  type InternalCollection = any;
  type InternalCursor = any;
  //declare opaque type Connection;
  //declare opaque type InternalCollection;
  //declare opaque type InternalCursor;

  export type Query = {
    [K in string]: any;
  };

  // This type is the same as the Query type, and is just used to avoid type errors when the type
  // passed in to the update field/parameter isn't fully compatible when mutated at runtime.
  type ReadOnlyQuery = Query;

  type CollationParam = {
    readonly locale: string,
    readonly caseLevel?: boolean,
    readonly caseFirst?: "upper" | "lower" | "off",
    readonly strength?: 1 | 2 | 3 | 4 | 5,
    readonly numericOrdering?: boolean,
    readonly alternate?: "non-ignorable" | "shifted",
    readonly maxVariable?: "punct" | "space",
    readonly backwards?: boolean,
    readonly normalization?: boolean
  };

  type TailableOptions = {
    readonly tailable?: false
  } | {
    readonly tailable: true,
    readonly awaitData?: false
  } | {
    readonly tailable: true,
    readonly awaitData: true,
    readonly maxAwaitTimeMS?: number
  };

  type QueryOptions = {
    limit?: number,
    sort?: any,
    projection?: Projection,
    skip?: number,
    hint?: any,
    explain?: boolean,
    snapshot?: boolean,
    timeout?: boolean,
    batchSize?: number,
    returnKey?: boolean,
    min?: number,
    max?: number,
    showDiskLoc?: boolean,
    comment?: string,
    raw?: boolean,
    promoteLongs?: boolean,
    promoteValues?: boolean,
    promoteBuffers?: boolean,
    readPreference?: ReadPreference,
    partial?: boolean,
    maxTimeMS?: number,
    noCursorTimeout?: boolean,
    collation?: CollationParam,
    session?: ClientSession
  } & TailableOptions;

  type FindAndModifyParams = {
    readonly query: ReadOnlyQuery,
    readonly sort?: any,
    readonly remove?: boolean,
    readonly update?: ReadOnlyUpdate | AggregationUpdate,
    readonly new?: boolean,
    readonly fields?: Projection,
    readonly upsert?: boolean,
    readonly bypassDocumentValidation?: boolean,
    readonly writeConcern?: WriteConcern,
    readonly maxTimeMS?: number,
    readonly findAndModify?: string,
    readonly collation?: CollationParam,
    // mutually exclusive with update: mixed[]
    readonly arrayFilters?: any[]
  };

  type BaseUpsertOptions = {
    bypassDocumentValidation?: boolean,
    checkKeys?: boolean,
    ignoreUndefined?: boolean,
    serializeFunctions?: boolean,
    // TODO: merge with WriteConcern
    session?: ClientSession
  } & WriteConcern;

  type UpdateOptions = {
    arrayFilters?: any[],
    collation?: CollationParam,
    hint?: any,
    upsert?: boolean,
    multi?: boolean
  } & BaseUpsertOptions;

  type ReplaceOptions = {
    readonly collation?: CollationParam,
    readonly hint?: any
  } & BaseUpsertOptions;

  type InsertOptions = {
    readonly forceServerObjectId?: boolean
  } & BaseUpsertOptions;

  type RemoveOptions = boolean | {
    justOne: boolean,
    collation?: CollationParam,
    checkKeys?: boolean,
    serializeFunctions?: boolean,
    ignoreUndefined?: boolean,
    session?: ClientSession
  } & WriteConcern;

  type RenameOptions = {
    readonly dropTarget?: boolean,
    readonly session?: ClientSession
  };

  type UpdateOrReplaceResult = {
    ok: number,
    n: number,
    nModified: number
  };

  // Note that this type differs slightly from the one provided by the MongoDB native driver.
  type DeleteResult = {
    // ok === 1 on success
    ok: number,
    n: number,
    deletedCount: number
  };

  type BaseRunCommandOptions = {
    readonly readPreference?: ReadPreference
  };

  type RunCommandOptions = {
    [K in string]: 1;
  };

  interface MongoJSDuck {
    _getConnection: ((arg0: any) => any);
  }

  type MapParam = string | (() => void);
  type ReduceParam<R> = string | ((key: any, values: any[]) => R);

  // http://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html#mapReduce
  type MapReduceOptions<R> = {
    readonly readPreference?: ReadPreference,
    readonly out: {
      inline: 1
    } | {
      [K in "replace" | "merge" | "reduce"]: "string";
    },
    readonly query?: ReadOnlyQuery,
    readonly sort?: any,
    readonly limit?: number,
    readonly keeptemp?: boolean,
    readonly finalize?: string | ((key: any, value: R) => any),
    readonly scope?: any,
    readonly jsMode?: boolean,
    readonly verbose?: boolean,
    readonly bypassDocumentValidation?: boolean,
    readonly session?: ClientSession
  };

  type IndexType = "2d" | "2dsphere" | "geoHaystack" | "text" | "hashed";
  type IndexFieldSpec = -1 | 1 | IndexType;

  type BaseIndex = string | {
    [K in string]: IndexFieldSpec;
  };

  type Index = BaseIndex | BaseIndex | [string, IndexFieldSpec][];

  type IndexOptions = {
    unique?: boolean,
    sparse?: boolean,
    background?: boolean,
    dropDups?: boolean,
    min?: number,
    max?: number,
    v?: number,
    expireAfterSeconds?: number,
    name?: string,
    partialFilterExpression?: {
      [K in string]: any;
    },
    collation?: CollationParam,
    session?: ClientSession
  } & WriteConcern;

  type AggregationPipeline = ReadonlyArray<{
    readonly $addFields: any
  } | {
    readonly $bucket: any
  } | {
    readonly $bucketAuto: any
  } | {
    readonly $collStats: any
  } | {
    readonly $count: any
  } | {
    readonly $facet: any
  } | {
    readonly $geoNear: any
  } | {
    readonly $graphLookup: any
  } | {
    readonly $group: any
  } | {
    readonly $indexStats: any
  } | {
    readonly $limit: any
  } | {
    readonly $listSessions: any
  } | {
    readonly $lookup: any
  } | {
    readonly $match: any
  } | {
    readonly $merge: any
  } | {
    readonly $out: any
  } | {
    readonly $planCacheStats: any
  } | {
    readonly $project: any
  } | {
    readonly $redact: any
  } | {
    readonly $replaceRoot: any
  } | {
    readonly $replaceWith: any
  } | {
    readonly $sample: any
  } | {
    readonly $set: any
  } | {
    readonly $skip: any
  } | {
    readonly $sort: any
  } | {
    readonly $sortByCount: any
  } | {
    readonly $unset: any
  } | {
    readonly $unwind: any
  }>;

  type AggregationOptions = {
    readonly readPreference?: ReadPreference,
    readonly batchSize?: number,
    readonly cursor?: any,
    readonly explain?: boolean,
    readonly allowDiskUse?: boolean,
    readonly maxTimeMS?: number,
    readonly maxAwaitTimeMS?: number,
    readonly bypassDocumentValidation?: boolean,
    readonly raw?: boolean,
    readonly promoteLongs?: boolean,
    readonly promoteValues?: boolean,
    readonly promoteBuffers?: boolean,
    readonly collation?: CollationParam,
    readonly comment?: string,
    readonly hint?: string | {
      [K in string]: any;
    },
    readonly session?: ClientSession
  };

  export declare class Cursor<Doc> extends stream$Readable {
    constructor(cursorFactory: (() => Promise<InternalCursor>)): Cursor<Doc>;
    addCursorFlag(flag: string, value: any): this;
    batchSize(value: number): this;
    close(): Promise<any>;
    collation(value: CollationParam): this;
    count(): Promise<number>;
    destroy(): Promise<any>;
    explain(): Promise<any>;
    forEach(fn: ((doc: Doc) => any)): Promise<void>;
    getCursor(): Promise<InternalCursor>;
    hasNext(): Promise<boolean>;

    hint(
      index: Index | {
        $natural: 1 | -1
      }
    ): this;

    limit(limit: number): this;
    map(fn: ((doc: Doc) => V)): Promise<V[]>;

    max(
      indexBounds: {
        [K in string]: any;
      }
    ): this;

    maxTimeMS(ms: number): this;

    min(
      indexBounds: {
        [K in string]: any;
      }
    ): this;

    next(): Promise<Doc | null>;
    rewind(): Promise<any>;
    size(): Promise<number>;
    skip(offset: number): this;
    snapshot(): this;

    sort(
      order: {
        readonly $natural: 1
      } | {
        [K in string]: -1 | 1 | {
          readonly $meta: "textScore"
        };
      }
    ): this;

    toArray(): Promise<Doc[]>;
    @@asyncIterator(): AsyncIterator<Doc>;
  }

  type Expression = any;

  type ConstrainedProjection<V> = {
    [K in string]: V | {
      $meta: "textScore"
    } | {
      $slice: number | [number, number]
    } | {
      $elemMatch: Expression
    };
  };

  export type Projection = {
    _id?: false | 0 | true | 1
  } & ConstrainedProjection<0 | false> | ConstrainedProjection<1 | true>;

  type AggregationUpdate = ReadonlyArray<{
    [K in "$addFields" | "$set" | "$replaceWith"]: {
      [K in string]: Expression;
    };
  } | {
    readonly $project: {
      [K in string]: 0 | false;
    } | {
      [K in string]: Expression | 1 | true;
    }
  } | {
    readonly $unset: string | string[]
  } | {
    readonly $replaceRoot: {
      readonly newRoot: {
        [K in string]: Expression;
      }
    }
  }>;

  export type Update = {
    $addToSet?: {
      [K in string]: any;
    },
    $bit?: {
      [K in "and" | "or" | "xor"]: number;
    },
    $currentDate?: {
      [K in string]: true | {
        $type: "timestamp" | "date"
      };
    },
    $inc?: {
      [K in string]: number;
    },
    $max?: {
      [K in string]: any;
    },
    $min?: {
      [K in string]: any;
    },
    $pop?: {
      [K in string]: -1 | 1;
    },
    $pull?: {
      [K in string]: any;
    },
    $pullAll?: {
      [K in string]: any;
    },
    $push?: {
      [K in string]: any;
    },
    $rename?: {
      [K in string]: any;
    },
    $set?: {
      [K in string]: any;
    },
    // TODO: forbid this option if upsert is not true.
    $setOnInsert?: {
      [K in string]: any;
    },
    $unset?: {
      [K in string]: any;
    }
  };

  // This type is the same as the Update type, and is just used to avoid type errors when the type
  // passed in to the update field/parameter isn't fully compatible when mutated at runtime.
  type ReadOnlyUpdate = {
    readonly $addToSet?: {
      [K in string]: any;
    },
    readonly $bit?: {
      [K in "and" | "or" | "xor"]: number;
    },
    readonly $currentDate?: {
      [K in string]: true | {
        readonly $type: "timestamp" | "date"
      };
    },
    readonly $inc?: {
      [K in string]: number;
    },
    readonly $max?: {
      [K in string]: any;
    },
    readonly $min?: {
      [K in string]: any;
    },
    readonly $pop?: {
      [K in string]: -1 | 1;
    },
    readonly $pull?: {
      [K in string]: any;
    },
    readonly $pullAll?: {
      [K in string]: any;
    },
    readonly $push?: {
      [K in string]: any;
    },
    readonly $rename?: {
      [K in string]: any;
    },
    readonly $set?: {
      [K in string]: any;
    },
    // TODO: forbid this option if upsert is not true.
    readonly $setOnInsert?: {
      [K in string]: any;
    },
    readonly $unset?: {
      [K in string]: any;
    }
  };

  type AddObjectIDField = (<Doc>(doc: Doc) => {
    _id: ObjectID
  } & Doc);

  export declare class Collection {
    constructor(db: Database_, name: string): Collection;
    name: string;
    connect(): Promise<InternalCollection>;
    find(query?: ReadOnlyQuery, projection?: Projection, options?: QueryOptions): Promise<Doc[]>;
    findAsCursor(query?: ReadOnlyQuery, projection?: Projection, options?: QueryOptions): Cursor<Doc>;
    findOne(query?: ReadOnlyQuery, projection?: Projection, options?: QueryOptions): Promise<Doc | null>;

    findAndModify(
      options: {
        upsert: true
      } & FindAndModifyParams
    ): Promise<Doc>;

    findAndModify(options: FindAndModifyParams): Promise<Doc | null>;
    count(query: ReadOnlyQuery): Promise<number>;
    distinct(field: string, query: ReadOnlyQuery): Promise<FieldType[]>;
    insert: typeof Collection.prototype.insertOne & typeof Collection.prototype.insertMany;
    insertOne(doc: Doc, options?: InsertOptions): Promise<ReturnType<AddObjectIDField>>;
    insertMany(docs: Docs, options?: InsertOptions): Promise<$TupleMap<Docs, AddObjectIDField>>;

    // TODO: improve safety by restricting update type.
    update(
      query: ReadOnlyQuery,
      update: ReadOnlyUpdate | AggregationUpdate,
      options?: UpdateOptions
    ): Promise<UpdateOrReplaceResult>;

    replaceOne(query: ReadOnlyQuery, replacement: any, options?: ReplaceOptions): Promise<UpdateOrReplaceResult>;

    // TODO: restrict to some form of ArbitraryBSON.
    save(doc: Doc, options?: BaseUpsertOptions): Promise<{
      _id: ObjectID
    } & Doc>;

    remove(query: ReadOnlyQuery, options?: RemoveOptions): Promise<DeleteResult>;
    rename(name: string, options?: RenameOptions): Promise<InternalCollection>;

    // TODO: refine this based on the provided command name.
    runCommand(command: string, options?: BaseRunCommandOptions): Promise<any>;

    drop(): Promise<any>;
    stats(): Promise<any>;
    mapReduce(map: MapParam, reduce: ReduceParam<R>, options: MapReduceOptions<R>): Promise<any>;
    dropIndexes(): Promise<any>;
    dropIndex(index: string): Promise<any>;
    createIndex(index: Index, options?: IndexOptions): Promise<any>;
    ensureIndex: typeof Collection.prototype.createIndex;
    getIndexes(): Promise<any>;
    reIndex(): Promise<any>;
    isCapped(): Promise<boolean>;
    aggregate(pipeline: AggregationPipeline, options?: AggregationOptions): Promise<Doc[]>;
    aggregateAsCursor(pipeline: AggregationPipeline, options?: AggregationOptions): Cursor<Doc>;
    initializeOrderedBulkOp(options?: BulkOptions): Bulk;
    initializeUnorderedBulkOp(options?: BulkOptions): Bulk;
  }

  type MaybePromise<T> = T | Promise<T>;

  type CollectionOptions = {
    readonly capped?: boolean,
    readonly size?: number,
    readonly max?: number,
    readonly storageEngine?: {
      [K in string]: any;
    },
    readonly validator?: {
      [K in string]: any;
    },
    readonly validationLevel?: "off" | "strict" | "moderate",
    readonly validationAction?: "error" | "warn",
    readonly indexOptionDefaults?: {
      [K in string]: any;
    },
    readonly collation?: CollationParam,
    readonly writeConcern?: {
      [K in string]: any;
    }
  };

  type Stats = {
    db: string,
    collections: number,
    objects: number,
    avgObjectSize: number,
    dataSize: number,
    storageSize: number,
    numExtents: number,
    indexes: number,
    indexSize: number,
    scaleFactor?: number,
    fsUsedSize?: number,
    fsTotalSize?: number,
    ok?: number
  };

  declare class Database_ extends events$EventEmitter {
    constructor(connectionString: MaybePromise<string>, options?: ConnectionOptions): Database_;
    constructor(database: MaybePromise<Database_ | DatabaseWithProxy | MongoJSDuck>): Database_;
    connect(): Promise<Connection>;
    close(force?: boolean): Promise<void>;
    dropDatabase(): Promise<any>;
    collection(name: string): Collection;
    createCollection(name: string, options?: CollectionOptions): Promise<any>;
    getCollectionInfos(): Promise<any[]>;
    getCollectionNames(): Promise<string[]>;
    listCollections(): Promise<any[]>;
    adminCommand(command: string | RunCommandOptions): Promise<any>;
    runCommand(command: string | RunCommandOptions): Promise<any>;
    createUser(user: any): Promise<any>;
    dropAllUsers(): Promise<any>;
    dropUser(username: string): Promise<any>;
    getLastError(): Promise<string | null>;

    getLastErrorObj(): Promise<{
      [K in string]: any;
    }>;

    stats(scale?: any): Promise<Stats>;
  }

  export type DatabaseWithProxy = Database_ & {
    [K in string]: Collection;
  };

  export declare class ObjectID {
    constructor(value?: string | number | ObjectID | null): ObjectID;
    generationTime: number;
    createFromHexString(hexString: string): ObjectID;
    createFromTime(time: number): ObjectID;
    isValid(id: ObjectID | Buffer | number): true;
    isValid(id: string | any): boolean;
    equals(objectID: ObjectID): boolean;
    generate(time?: number): Buffer;
    getTimestamp(): Date;
    toHexString(): string;
  }

  type ConnectFn = {
    default: ConnectFn,
    Database: DatabaseWithProxy,
    Collection: typeof Collection,
    Cursor: typeof Cursor,
    Bulk: Bulk,
    ObjectId: typeof ObjectID,
    ObjectID: typeof ObjectID,
    Binary: any,
    Code: any,
    DBRef: any,
    Double: any,
    Long: any,
    NumberLong: any,
    MinKey: any,
    MaxKey: any,
    Symbol: any,
    Timestamp: typeof Timestamp
  };

  declare function ConnectFn(
    connectionString: MaybePromise<string>,
    options?: ConnectionOptions,
  ): DatabaseWithProxy;
  declare function ConnectFn(
    database: MaybePromise<Database_ | DatabaseWithProxy | MongoJSDuck>,
  ): DatabaseWithProxy;

  export default ConnectFn;



  export const ObjectId = ObjectID;
  export type Database = DatabaseWithProxy;

  export type Binary = any;
  export type Code = any;
  export type DBRef = any;
  export type Double = any;
  export type Long = any;
  export type NumberLong = any;
  export type MinKey = any;
  export type MaxKey = any;
  export type Symbol = any;
}
