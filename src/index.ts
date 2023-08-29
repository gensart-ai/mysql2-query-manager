import { Connection, Pool } from 'mysql2';
import helper from './helper';

type MySQLConnection = Connection | Pool;

type WhereOperator = '=' | '>' | '<' | '>=' | '<=' | '<>';

type LogicalOperator = 'AND' | 'OR';

type OrderType = 'ASC' | 'DESC';

enum JoinType {
    INNER = 'inner',
    OUTER = 'outer'
}

type WhereClause = {
    field: string,
    operator: WhereOperator,
    logicalOperator: LogicalOperator
};

type JoinClause = {
    table: string,
    condition: string
    joinType: 'inner' | 'outer'
}

type OrderClause = {
    field: string,
    type: OrderType
}

type GroupClause = {
    field: string
}

type ParameterizedQuery = {
    where: {
        [key: string]: string
    }
}

class QueryManager {
    private table: string;
    private connection: MySQLConnection;
    private isSourceConnected: boolean;

    private querySelect: string[] = [];
    private queryWhere: WhereClause[] = [];
    private queryJoin: JoinClause[] = [];
    private queryOrder: OrderClause[] = [];
    private queryGroup: GroupClause[] = [];

    private paramsQuery: ParameterizedQuery = {
        where: {}
    };

    constructor(
        table: string,
        connection: MySQLConnection
    ) {
        this.table = table
        this.connection = connection
    }

    public select(selectQuery: string = '*'): QueryManager {
        let selects: string[] = selectQuery.split(',');

        selects.forEach((select: string) => {
            select = select.trim();

            if (helper.isNotEmpty(select)) {
                this.querySelect.push(select);
            }
        })
        return this;
    }


    public where(field: string, operator: WhereOperator = '=', value: string): QueryManager {
        this.queryWhere.push({
            field: field,
            operator: operator,
            logicalOperator: 'AND'
        });

        this.paramsQuery.where[field] = value;

        return this;
    }

    public orWhere(field: string, operator: WhereOperator = '=', value: string): QueryManager {
        // If Object.where() never been called before, it must be called first
        if (this.queryWhere.length == 0) {
            throw Error('QueryManager: Please call QueryManager.where() first before calling this method!');
        }

        this.queryWhere.push({
            field: field,
            operator: operator,
            logicalOperator: 'OR'
        });
        this.paramsQuery.where[field] = value;

        return this;
    }

    public andWhere(field: string, operator: WhereOperator = '=', value: string): QueryManager {
        // If Object.where() never been called before, it must be called first
        if (this.queryWhere.length == 0) {
            throw Error('QueryManager: Please call QueryManager.where() first before calling this method!');
        }

        this.queryWhere.push({
            field: field,
            operator: operator,
            logicalOperator: 'AND'
        });
        this.paramsQuery.where[field] = value;

        return this;
    }

    public innerJoin(onTableName: string, condition: string): QueryManager {
        this.queryJoin.push({
            table: onTableName,
            condition: condition,
            joinType: 'inner'
        });
        return this;
    }

    public orderBy(field: string, orderType: OrderType = 'ASC'): QueryManager {
        this.queryOrder.push({
            field: field,
            type: orderType
        })
        return this;
    }

    public groupBy(field: string): QueryManager {
        this.queryGroup.push({
            field: field
        });
        return this;
    }

    public compileQuerySelect(): { query: string, params: string[] } {
        let query: string;
        let params: string[] = [];

        query = 'SELECT ';

        if (helper.isNotEmpty(this.querySelect)) {
            query += this.querySelect.join(', ') + ' ';
        } else {
            query += '* ';
        }

        query += `FROM ${this.table}`;

        if (helper.isNotEmpty(this.queryJoin)) {
            this.queryJoin.forEach(queryJoin => {
                if (queryJoin.joinType == JoinType.INNER) {
                    query += ` INNER JOIN ${queryJoin.table} ON ${queryJoin.condition}`;
                }
            })
        }

        if (helper.isNotEmpty(this.queryWhere)) {

            let firstQueryWhere: WhereClause = this.queryWhere[0];

            query += ` WHERE ${firstQueryWhere.field} ${firstQueryWhere.operator} ?`;
            params.push(this.paramsQuery.where[firstQueryWhere.field]);

            this.queryWhere.slice(1).forEach(queryWhere => {
                query += ` ${queryWhere.logicalOperator} ${queryWhere.field} ${queryWhere.operator} ?`;
                params.push(this.paramsQuery.where[queryWhere.field]);
            })
        }

        if (helper.isNotEmpty(this.queryGroup)) {
            let group: string = '';
            this.queryGroup.forEach(queryGroup => {
                group += queryGroup.field + ', ';
            })

            if (group.slice(-2) == ', ') {
                group = group.slice(0, -2);
            }
            query += ` GROUP BY ${group}`;
        }

        if (helper.isNotEmpty(this.queryOrder)) {
            let order: string = '';
            this.queryOrder.forEach(queryOrder => {
                order += queryOrder.field + ' ' + queryOrder.type + ', ';
            })

            if (order.slice(-2) == ', ') {
                order = order.slice(0, -2);
            }
            query += ` ORDER BY ${order}`;
        }

        return {
            query: query,
            params: params
        };
    }

    public onResultObject(callback: (error: Error, result: string) => void, resetQuery: boolean = true): void {
        let statement: {query: string, params: string[]} = this.compileQuerySelect();

        this.connection.query({
            sql: statement.query,
        }, callback);

        if (resetQuery) {
            this.resetAllQuery();
        }
    }

    private resetAllQuery(): void {
        this.querySelect = [];
        this.queryWhere = [];
        this.queryJoin = [];
        this.queryOrder = [];
        this.queryGroup = [];
    }
}

export {
    QueryManager
}