import { inArray } from 'drizzle-orm';
import TransHolder from '../../common/utils/TransHolder';
import db from '../../db/db';
import {
    SentenceTranslate,
    sentenceTranslates,
} from '../../db/tables/sentenceTranslates';
import { p } from '../../common/utils/Util';

export default class SentenceTranslateService {
    public static async fetchTranslates(
        sentences: string[]
    ): Promise<TransHolder<string>> {
        sentences = [...sentences, '-1'];
        const result = new TransHolder<string>();
        const values: SentenceTranslate[] = await db
            .select()
            .from(sentenceTranslates)
            .where(
                inArray(
                    sentenceTranslates.sentence,
                    sentences.map((w) => p(w))
                )
            );
        values.forEach((e) => {
            result.add(e.sentence ?? '', e.translate ?? '');
        });

        return result;
    }

    public static async recordTranslate(sentence: string, translate: string) {
        await db
            .insert(sentenceTranslates)
            .values({
                sentence: p(sentence),
                translate,
            })
            .onConflictDoUpdate({
                target: sentenceTranslates.sentence,
                set: {
                    translate,
                },
            });
    }

    static async recordBatch(validTrans: TransHolder<string>) {
        validTrans.getMapping().forEach((value, key) => {
            this.recordTranslate(p(key), value);
        });
    }
}
